import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ButtomNave from "../components/ButtomNave";

const STATUS_CONFIG = {
  normal:        { label: "Normal",       color: "#10b981", bg: "#ecfdf5", ring: "#a7f3d0" },
  "pre-diabetic":{ label: "Pre-Diabetic", color: "#f59e0b", bg: "#fffbeb", ring: "#fde68a" },
  diabetic:      { label: "Diabetic",     color: "#ef4444", bg: "#fef2f2", ring: "#fecaca" },
};

function CircularProgress({ consumed, limit }) {
  const pct   = Math.min((consumed / limit) * 100, 100);
  const r     = 70;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;
  const color = pct < 80 ? "#10b981" : pct < 100 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="#f0fdf4" strokeWidth="14" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color, lineHeight: 1 }}>
          {consumed}g
        </span>
        <span style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 2, marginTop: 2 }}>
          OF {limit}g
        </span>
        <span style={{ fontSize: 13, color: pct >= 100 ? "#ef4444" : "#6b7280", marginTop: 4, fontWeight: 600 }}>
          {pct >= 100 ? "LIMIT HIT!" : `${Math.round(pct)}% used`}
        </span>
      </div>
    </div>
  );
}

function AlertBanner({ consumed, limit }) {
  const pct = (consumed / limit) * 100;
  if (pct < 80) return null;
  return (
    <div style={{
      background: pct >= 100 ? "#fef2f2" : "#fffbeb",
      border: `1.5px solid ${pct >= 100 ? "#fca5a5" : "#fde68a"}`,
      borderRadius: 14, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 10, marginBottom: 16
    }}>
      <span style={{ fontSize: 22 }}>{pct >= 100 ? "🚨" : "⚠️"}</span>
      <div>
        <p style={{ fontWeight: 700, color: pct >= 100 ? "#dc2626" : "#d97706", fontSize: 13, margin: 0 }}>
          {pct >= 100 ? "Daily sugar limit poori ho gayi!" : "80% limit use ho gayi — dhyan rakho!"}
        </p>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, marginTop: 2 }}>
          {pct >= 120 ? "Doctor se milna suggest kiya jaata hai." : "Ab meetha avoid karo."}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashData,  setDashData]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("today");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // ── Real API call ──
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const res  = await fetch("/api/dashboard", {
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
  }, []);

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fffe" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, margin: 0 }}>🩸</p>
        <p style={{ color: "#10b981", fontWeight: 600, marginTop: 12 }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  if (!dashData) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 32 }}>😕</p>
        <p style={{ color: "#6b7280" }}>Data load nahi hua</p>
        <button onClick={() => window.location.reload()}
          style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", marginTop: 10 }}>
          Dobara Try Karo
        </button>
      </div>
    </div>
  );

  // ── Real data variables ──
  const USER      = dashData.user;
  const consumed  = dashData.consumed  || 0;
  const meals     = dashData.meals     || [];
  const limit     = USER.dailySugarLimit || 50;
  const remaining = limit - consumed;
  const cfg       = STATUS_CONFIG[USER.sugarStatus] || STATUS_CONFIG["normal"];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fffe", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e8faf4",
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(16,185,129,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🩸</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#065f46" }}>BSUGAR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.ring}`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5
          }}>
            {cfg.label.toUpperCase()}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14
          }}>
            {USER.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#064e3b", margin: 0 }}>
            Hii, {USER.name} 👋
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <AlertBanner consumed={consumed} limit={limit} />

        {/* ── PROFILE CARD — onboarding ka data ── */}
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: "16px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
          border: "1px solid #e8faf4", marginBottom: 16
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 12px" }}>
            👤 YOUR PROFILE
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
            {[
              { label: "Age",    value: USER.age    ? `${USER.age} yrs`   : "—" },
              { label: "Gender", value: USER.gender ? USER.gender          : "—" },
              { label: "Weight", value: USER.weight ? `${USER.weight} kg` : "—" },
              { label: "Height", value: USER.height ? `${USER.height} cm` : "—" },
            ].map(item => (
              <div key={item.label} style={{
                background: "#f8fffe", borderRadius: 12,
                padding: "10px 8px", textAlign: "center",
                border: "1px solid #e8faf4"
              }}>
                <p style={{ fontSize: 9, color: "#9ca3af", margin: 0, letterSpacing: 1 }}>
                  {item.label.toUpperCase()}
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#065f46", margin: "4px 0 0", textTransform: "capitalize" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>

          {/* SUGAR METER */}
          <div style={{
            background: "#fff", borderRadius: 20,
            padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
            border: "1px solid #e8faf4", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 16px" }}>
              TODAY'S SUGAR METER
            </p>
            <CircularProgress consumed={consumed} limit={limit} />
            <div style={{ display: "flex", gap: 24, marginTop: 20, width: "100%", justifyContent: "center" }}>
              {[
                { val: `${consumed}g`,                                        label: "CONSUMED",  color: "#10b981"                          },
                { val: remaining > 0 ? `${remaining}g` : "0g",               label: "REMAINING", color: remaining > 0 ? "#065f46" : "#ef4444" },
                { val: `${limit}g`,                                           label: "DAILY LIMIT",color: "#374151"                         },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: 0 }}>{s.val}</p>
                  <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SUGAR REPORT */}
          <div style={{
            background: "#fff", borderRadius: 20,
            padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
            border: "1px solid #e8faf4"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 16px" }}>
              SUGAR REPORT SUMMARY
            </p>

            {/* Fasting bar */}
            {[
              { label: "🌙 Fasting Sugar",  val: USER.lastFasting,  max: 200, good: 100, bad: 126, note: "Normal: <100 mg/dL"  },
              { label: "🍽️ Post-Meal (PP)", val: USER.lastPostMeal, max: 280, good: 140, bad: 200, note: "Normal: <140 mg/dL" },
            ].map(row => {
              const barColor = row.val < row.good ? "#10b981" : row.val < row.bad ? "#f59e0b" : "#ef4444";
              return (
                <div key={row.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                      {row.val || "—"} mg/dL
                    </span>
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: 8, height: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 8,
                      width: `${Math.min(((row.val || 0) / row.max) * 100, 100)}%`,
                      background: barColor, transition: "width 1s ease"
                    }} />
                  </div>
                  <p style={{ fontSize: 10, color: "#9ca3af", margin: "4px 0 0" }}>{row.note}</p>
                </div>
              );
            })}

            {/* Status box */}
            <div style={{
              background: cfg.bg, border: `1px solid ${cfg.ring}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 20 }}>
                {USER.sugarStatus === "normal" ? "✅" : USER.sugarStatus === "pre-diabetic" ? "⚠️" : "🔴"}
              </span>
              <div>
                <p style={{ fontWeight: 700, color: cfg.color, fontSize: 13, margin: 0 }}>{cfg.label} Range</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                  {USER.sugarStatus === "normal" ? "Keep it up!" :
                    USER.sugarStatus === "pre-diabetic" ? "Control diet carefully" : "Please consult doctor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MEAL LOG */}
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
          border: "1px solid #e8faf4", marginBottom: 16
        }}>
          <div style={{ display: "flex", gap: 4, background: "#f0fdf4", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {["today", "weekly"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
                background: activeTab === tab ? "#10b981" : "transparent",
                color: activeTab === tab ? "#fff" : "#6b7280",
                fontWeight: 600, fontSize: 12, fontFamily: "inherit", transition: "all 0.2s"
              }}>
                {tab === "today" ? "Today's Meals" : "Weekly View"}
              </button>
            ))}
          </div>

          {activeTab === "today" && (
            meals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
                <p style={{ fontSize: 32, margin: 0 }}>🍽️</p>
                <p style={{ margin: "8px 0 0", fontSize: 13 }}>Aaj koi meal add nahi kiya</p>
                <button onClick={() => navigate("/meals")} style={{
                  marginTop: 12, background: "#10b981", color: "#fff",
                  border: "none", borderRadius: 10, padding: "8px 18px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>
                  + Meal Add Karo
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {meals.map(meal => (
                    <div key={meal._id} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 14px", background: "#f8fffe",
                      borderRadius: 14, border: "1px solid #e8faf4"
                    }}>
                      <span style={{ fontSize: 24, minWidth: 32, textAlign: "center" }}>{meal.icon || "🍽️"}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#1f2937", margin: 0, textTransform: "capitalize" }}>
                          {meal.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                          {meal.quantity} {meal.unit} · {meal.mealTime}
                        </p>
                      </div>
                      <span style={{
                        background: meal.totalSugar > 10 ? "#fef9c3" : "#ecfdf5",
                        color: meal.totalSugar > 10 ? "#ca8a04" : "#059669",
                        fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: 20
                      }}>
                        +{meal.totalSugar}g
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: 14, paddingTop: 14, borderTop: "1px dashed #d1fae5"
                }}>
                  <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Total consumed</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#065f46" }}>{consumed}g / {limit}g</span>
                </div>
              </>
            )
          )}

          {activeTab === "weekly" && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 32, margin: 0 }}>📊</p>
              <p style={{ margin: "8px 0 0", fontSize: 13 }}>Weekly chart — coming soon</p>
            </div>
          )}
        </div>

        {/* AI TIP */}
        <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", borderRadius: 20, padding: "20px", color: "#fff" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6ee7b7", margin: "0 0 10px" }}>
            💡 AI TIP FOR TODAY
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: "#d1fae5" }}>
            {USER.sugarStatus === "diabetic"
              ? <><strong style={{ color: "#fff" }}>Meetha bilkul avoid karein</strong> — aapki sugar level high hai. Doctor se zaroor milein.</>
              : USER.sugarStatus === "pre-diabetic"
              ? <>Post-meal sugar thodi zyada hai. <strong style={{ color: "#fff" }}>White rice ki jagah brown rice</strong> try karein.</>
              : <>Aap normal range mein hain! <strong style={{ color: "#fff" }}>Healthy diet jaari rakho</strong> aur daily limit ka dhyan rakho.</>
            }
          </p>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <ButtomNave/>

    </div>
  );
}