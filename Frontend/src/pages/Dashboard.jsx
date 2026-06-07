import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const STATUS_CONFIG = {
  normal:        { label: "Normal",       color: "#34d399", bg: "#0d1f0d", ring: "#10b981" },
  "pre-diabetic":{ label: "Pre-Diabetic", color: "#fbbf24", bg: "#1a1200", ring: "#f59e0b" },
  diabetic:      { label: "Diabetic",     color: "#f87171", bg: "#1a0000", ring: "#ef4444" },
};

function CircularProgress({ consumed, limit }) {
  const pct   = Math.min((consumed / limit) * 100, 100);
  const r     = 70;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;
  
  // Custom color based on consumed sugar level
  const color = pct < 80 ? "#10b981" : pct < 100 ? "#f59e0b" : "#ef4444";
  const glowColor = pct < 80 ? "rgba(16,185,129,0.3)" : pct < 100 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";

  return (
    <div style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 180,
      height: 180,
      animation: "fadeSlideUp 0.5s ease-out"
    }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        {/* Track Ring */}
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1a2e23" strokeWidth="12" />
        {/* Progress Ring with Glow */}
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease",
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>
      <div style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle, #111814 60%, transparent 100%)",
        width: 128,
        height: 128,
        borderRadius: "50%"
      }}>
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 34,
          color: color,
          lineHeight: 1,
          textShadow: `0 0 12px ${glowColor}`
        }}>
          {consumed}g
        </span>
        <span style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1.5, marginTop: 4 }}>
          OF {limit}g
        </span>
        <span style={{
          fontSize: 11,
          color: pct >= 100 ? "#ef4444" : "#e8fdf4",
          opacity: pct >= 100 ? 1 : 0.7,
          marginTop: 6,
          fontWeight: 600,
          textShadow: pct >= 100 ? "0 0 8px rgba(239,68,68,0.5)" : "none"
        }}>
          {pct >= 100 ? "LIMIT HIT!" : `${Math.round(pct)}% used`}
        </span>
      </div>
    </div>
  );
}

function AlertBanner({ consumed, limit }) {
  const pct = (consumed / limit) * 100;
  if (pct < 80) return null;
  
  const isDanger = pct >= 100;
  const bg = isDanger ? "#1a0000" : "#1a1200";
  const border = isDanger ? "#ef4444" : "#f59e0b";
  const glow = isDanger ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)";
  const textColor = isDanger ? "#f87171" : "#fbbf24";
  
  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 20,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
      boxShadow: `0 4px 20px ${glow}`,
      animation: "glowPulse 2s infinite ease-in-out, fadeSlideUp 0.5s ease-out"
    }}>
      <span style={{ fontSize: 24, filter: `drop-shadow(0 0 6px ${border})` }}>
        {isDanger ? "🚨" : "⚠️"}
      </span>
      <div>
        <p style={{ fontWeight: 700, color: textColor, fontSize: 14, margin: 0 }}>
          {isDanger ? "Daily sugar limit poori ho gayi!" : "80% limit use ho gayi — dhyan rakho!"}
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0, marginTop: 4 }}>
          {isDanger ? "Doctor se milna suggest kiya jaata hai." : "Ab meetha avoid karo."}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  // Hover states managed in state
  const [hoveredPill, setHoveredPill] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [btnHover, setBtnHover] = useState(false);

  // Fetch Dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const res = await fetch("/api/dashboard", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.status === 401) {
          localStorage.clear();
          navigate("/");
          return;
        }

        const data = await res.json();
        setDashData(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0f0d",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 54, margin: 0, animation: "float 2s infinite ease-in-out" }}>🩸</p>
        <p style={{ color: "#10b981", fontWeight: 600, marginTop: 16, fontSize: 14, letterSpacing: 0.5 }}>
          LOADING YOUR DASHBOARD...
        </p>
      </div>
    </div>
  );

  if (!dashData) return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0f0d",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#e8fdf4"
    }}>
      <div style={{ textAlign: "center", padding: 20 }}>
        <p style={{ fontSize: 44 }}>😕</p>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>Data load nahi hua</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "12px 24px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(16,185,129,0.3)"
          }}
        >
          Dobara Try Karo
        </button>
      </div>
    </div>
  );

  const USER      = dashData?.user || {};
  const consumed  = dashData?.consumed  || 0;
  const meals     = dashData?.meals     || [];
  const limit     = USER?.dailySugarLimit || 50;
  const remaining = limit - consumed;
  const cfg       = STATUS_CONFIG[USER?.sugarStatus] || STATUS_CONFIG["normal"];

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#0a0f0d",
      color: "#e8fdf4",
      minHeight: "100vh",
      animation: "fadeIn 0.5s ease-out"
    }}>

      {/* NAVBAR */}
      <nav style={{
        background: "rgba(10, 15, 13, 0.95)",
        borderBottom: "1px solid #1a2e23",
        padding: "0 20px",
        height: 65,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24, filter: "drop-shadow(0 0 6px #10b981)" }}>🩸</span>
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 22,
            color: "#e8fdf4",
            letterSpacing: 0.5
          }}>
            BSUGAR
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.ring}`,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: `0 0 10px ${cfg.ring}22`
          }}>
            {cfg.label.toUpperCase()}
          </span>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            boxShadow: "0 0 12px rgba(16,185,129,0.4)"
          }}>
            {USER.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: 24, animation: "fadeSlideUp 0.5s ease-out" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 32,
            color: "#e8fdf4",
            margin: 0,
            fontWeight: 400
          }}>
            Hii, {USER.name} 👋
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "6px 0 0", fontWeight: 500 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <AlertBanner consumed={consumed} limit={limit} />

        {/* PROFILE CARD */}
        <div style={{
          background: "#111814",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid #1a2e23",
          marginBottom: 20,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          animation: "fadeSlideUp 0.6s ease-out"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 16px" }}>
            👤 YOUR PROFILE
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12 }}>
            {[
              { id: "age", label: "Age", value: USER.age ? `${USER.age} yrs` : "—" },
              { id: "gender", label: "Gender", value: USER.gender ? USER.gender : "—" },
              { id: "weight", label: "Weight", value: USER.weight ? `${USER.weight} kg` : "—" },
              { id: "height", label: "Height", value: USER.height ? `${USER.height} cm` : "—" },
            ].map(item => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredPill(item.id)}
                onMouseLeave={() => setHoveredPill(null)}
                style={{
                  background: hoveredPill === item.id ? "#162218" : "#0d1611",
                  borderRadius: 14,
                  padding: "12px 10px",
                  textAlign: "center",
                  border: hoveredPill === item.id ? "1px solid #10b981" : "1px solid #1a2e23",
                  transition: "all 0.2s ease"
                }}
              >
                <p style={{ fontSize: 9, color: "#6b7280", margin: 0, letterSpacing: 1.2, fontWeight: 600 }}>
                  {item.label.toUpperCase()}
                </p>
                <p style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#10b981",
                  margin: "6px 0 0",
                  textTransform: "capitalize"
                }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 20
        }}>

          {/* SUGAR METER CARD */}
          <div style={{
            background: "#111814",
            borderRadius: 20,
            padding: "24px 20px",
            border: "1px solid #1a2e23",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            animation: "fadeSlideUp 0.7s ease-out"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 20px" }}>
              TODAY'S SUGAR METER
            </p>
            <CircularProgress consumed={consumed} limit={limit} />
            <div style={{ display: "flex", gap: 24, marginTop: 24, width: "100%", justifyContent: "center" }}>
              {[
                { val: `${consumed}g`, label: "CONSUMED", color: "#10b981" },
                { val: remaining > 0 ? `${remaining}g` : "0g", label: "REMAINING", color: remaining > 0 ? "#34d399" : "#ef4444" },
                { val: `${limit}g`, label: "DAILY LIMIT", color: "#6b7280" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{
                    fontSize: 22,
                    fontWeight: 400,
                    fontFamily: "'DM Serif Display', serif",
                    color: s.color,
                    margin: 0
                  }}>
                    {s.val}
                  </p>
                  <p style={{ fontSize: 10, color: "#6b7280", margin: 0, marginTop: 4, letterSpacing: 0.8 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SUGAR REPORT SUMMARY CARD */}
          <div style={{
            background: "#111814",
            borderRadius: 20,
            padding: "24px 20px",
            border: "1px solid #1a2e23",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            animation: "fadeSlideUp 0.8s ease-out"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 20px" }}>
              SUGAR REPORT SUMMARY
            </p>

            {/* Fasting bar & Post Meal Bar */}
            {[
              { label: "🌙 Fasting Sugar", val: USER.lastFasting, max: 200, good: 100, bad: 126, note: "Normal: <100 mg/dL" },
              { label: "🍽️ Post-Meal (PP)", val: USER.lastPostMeal, max: 280, good: 140, bad: 200, note: "Normal: <140 mg/dL" },
            ].map(row => {
              const barColor = row.val < row.good ? "#10b981" : row.val < row.bad ? "#f59e0b" : "#ef4444";
              const glow = row.val < row.good ? "rgba(16,185,129,0.3)" : row.val < row.bad ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";
              return (
                <div key={row.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: "#e8fdf4", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: barColor }}>
                      {row.val || "—"} mg/dL
                    </span>
                  </div>
                  {/* Progress bar track */}
                  <div style={{ background: "#1a2e23", borderRadius: 8, height: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: 8,
                      width: `${Math.min(((row.val || 0) / row.max) * 100, 100)}%`,
                      background: barColor,
                      boxShadow: `0 0 8px ${glow}`,
                      transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: "#6b7280", margin: "6px 0 0" }}>{row.note}</p>
                </div>
              );
            })}

            {/* Status box */}
            <div style={{
              background: cfg.bg,
              border: `1px solid ${cfg.ring}`,
              borderRadius: 14,
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
              boxShadow: `0 0 15px ${cfg.ring}1a`
            }}>
              <span style={{ fontSize: 22, filter: `drop-shadow(0 0 4px ${cfg.ring})` }}>
                {USER.sugarStatus === "normal" ? "✅" : USER.sugarStatus === "pre-diabetic" ? "⚠️" : "🔴"}
              </span>
              <div>
                <p style={{ fontWeight: 700, color: cfg.color, fontSize: 13, margin: 0 }}>
                  {cfg.label} Range
                </p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0, marginTop: 2 }}>
                  {USER.sugarStatus === "normal" ? "Keep it up!" :
                    USER.sugarStatus === "pre-diabetic" ? "Control diet carefully" : "Please consult doctor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MEAL LOG CARD */}
        <div style={{
          background: "#111814",
          borderRadius: 20,
          padding: "24px 20px",
          border: "1px solid #1a2e23",
          marginBottom: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          animation: "fadeSlideUp 0.9s ease-out"
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: 6,
            background: "#0d1611",
            borderRadius: 14,
            padding: 4,
            marginBottom: 20,
            border: "1px solid #1a2e23"
          }}>
            {["today", "weekly"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                  color: activeTab === tab ? "#fff" : "#6b7280",
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === tab ? "0 2px 10px rgba(16,185,129,0.3)" : "none"
                }}
              >
                {tab === "today" ? "Today's Meals" : "Weekly View"}
              </button>
            ))}
          </div>

          {activeTab === "today" && (
            meals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280" }}>
                <p style={{ fontSize: 36, margin: 0 }}>🍽️</p>
                <p style={{ margin: "10px 0 0", fontSize: 13 }}>Aaj koi meal add nahi kiya</p>
                <button
                  onClick={() => navigate("/meals")}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  style={{
                    marginTop: 16,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "10px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: btnHover ? "0 4px 20px rgba(16,185,129,0.5)" : "0 4px 14px rgba(16,185,129,0.3)",
                    transform: btnHover ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.2s ease"
                  }}
                >
                  + Meal Add Karo
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {meals.map(meal => {
                    const isHighSugar = meal.totalSugar > 10;
                    const pillBg = isHighSugar ? "#1a1200" : "#0d1f0d";
                    const pillBorder = isHighSugar ? "#f59e0b" : "#10b981";
                    const pillText = isHighSugar ? "#fbbf24" : "#34d399";
                    return (
                      <div
                        key={meal._id}
                        onMouseEnter={() => setHoveredCard(meal._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 16px",
                          background: hoveredCard === meal._id ? "#162218" : "#0d1611",
                          borderRadius: 16,
                          border: hoveredCard === meal._id ? "1px solid #10b981" : "1px solid #1a2e23",
                          transition: "all 0.2s ease",
                          boxShadow: hoveredCard === meal._id ? "0 0 15px rgba(16,185,129,0.08)" : "none"
                        }}
                      >
                        <span style={{ fontSize: 26, minWidth: 32, textAlign: "center" }}>
                          {meal.icon || "🍽️"}
                        </span>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#e8fdf4",
                            margin: 0,
                            textTransform: "capitalize"
                          }}>
                            {meal.name}
                          </p>
                          <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                            {meal.quantity} {meal.unit} · {meal.mealTime}
                          </p>
                        </div>
                        <span style={{
                          background: pillBg,
                          color: pillText,
                          border: `1px solid ${pillBorder}`,
                          fontWeight: 700,
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 20
                        }}>
                          +{meal.totalSugar}g
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 18,
                  paddingTop: 18,
                  borderTop: "1px solid #1a2e23"
                }}>
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Total consumed</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>
                    {consumed}g / {limit}g
                  </span>
                </div>
              </>
            )
          )}

          {activeTab === "weekly" && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280" }}>
              <p style={{ fontSize: 36, margin: 0 }}>📊</p>
              <p style={{ margin: "10px 0 0", fontSize: 13 }}>Weekly chart — coming soon</p>
            </div>
          )}
        </div>

        {/* AI TIP CARD */}
        <div style={{
          background: "linear-gradient(135deg, #0d1f15 0%, #111814 100%)",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid #1a2e23",
          borderLeft: "4px solid #10b981",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          animation: "fadeSlideUp 1s ease-out"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#10b981", margin: "0 0 10px" }}>
            💡 AI TIP FOR TODAY
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: "#e8fdf4" }}>
            {dashData.aiTip}
          </p>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <BottomNav />

    </div>
  );
}