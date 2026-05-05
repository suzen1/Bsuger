import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA (baad mein API se aayega) ---
const USER = {
  name: "Arjun",
  dailyLimit: 60,
  consumed: 38,
  status: "pre-diabetic", // normal | pre-diabetic | diabetic
  fasting: 112,
  postMeal: 158,
};

const MEALS = [
  { id: 1, name: "Paratha", qty: "2 pieces", sugar: 4, time: "8:30 AM", icon: "🫓" },
  { id: 2, name: "Chai", qty: "1 cup", sugar: 8, time: "10:00 AM", icon: "☕" },
  { id: 3, name: "Dal Chawal", qty: "1 plate", sugar: 14, time: "1:30 PM", icon: "🍛" },
  { id: 4, name: "Mango", qty: "1 medium", sugar: 12, time: "4:00 PM", icon: "🥭" },
];

const STATUS_CONFIG = {
  normal: { label: "Normal", color: "#10b981", bg: "#ecfdf5", ring: "#a7f3d0" },
  "pre-diabetic": { label: "Pre-Diabetic", color: "#f59e0b", bg: "#fffbeb", ring: "#fde68a" },
  diabetic: { label: "Diabetic", color: "#ef4444", bg: "#fef2f2", ring: "#fecaca" },
};

// Circular progress SVG
function CircularProgress({ consumed, limit }) {
  const pct = Math.min((consumed / limit) * 100, 100);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct < 80 ? "#10b981" : pct < 100 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      <svg width="180" height="180" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="90" cy="90" r={r} fill="none" stroke="#f0fdf4" strokeWidth="14" />
        {/* Progress */}
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

// Alert Banner
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
  const [activeTab, setActiveTab] = useState("today");
  const [meals] = useState(MEALS);
  const cfg = STATUS_CONFIG[USER.status];

  useEffect(() => {
    // Google font load
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const remaining = USER.dailyLimit - USER.consumed;
  const pct = Math.round((USER.consumed / USER.dailyLimit) * 100);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fffe", minHeight: "100vh" }}>

      {/* ── TOP NAVBAR ── */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e8faf4",
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(16,185,129,0.07)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🩸</span>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#065f46" }}>
            BSUGAR
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Status badge */}
          <span style={{
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.ring}`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 700, letterSpacing: 0.5
          }}>
            {cfg.label.toUpperCase()}
          </span>
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer"
          }}>
            {USER.name[0]}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#064e3b", margin: 0 }}>
            Assalam o Alaikum, {USER.name} 👋
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Alert */}
        <AlertBanner consumed={USER.consumed} limit={USER.dailyLimit} />

        {/* ── MAIN GRID ── desktop: 2 col, mobile: 1 col */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16, marginBottom: 16
        }}>

          {/* SUGAR METER CARD */}
          <div style={{
            background: "#fff", borderRadius: 20,
            padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
            border: "1px solid #e8faf4", display: "flex", flexDirection: "column", alignItems: "center"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", marginBottom: 16, margin: "0 0 16px" }}>
              TODAY'S SUGAR METER
            </p>
            <CircularProgress consumed={USER.consumed} limit={USER.dailyLimit} />
            {/* Mini stats */}
            <div style={{ display: "flex", gap: 24, marginTop: 20, width: "100%", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#10b981", margin: 0 }}>{USER.consumed}g</p>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, marginTop: 2 }}>CONSUMED</p>
              </div>
              <div style={{ width: 1, background: "#f0fdf4" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: remaining > 0 ? "#065f46" : "#ef4444", margin: 0 }}>
                  {remaining > 0 ? remaining + "g" : "0g"}
                </p>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, marginTop: 2 }}>REMAINING</p>
              </div>
              <div style={{ width: 1, background: "#f0fdf4" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: "#374151", margin: 0 }}>{USER.dailyLimit}g</p>
                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, marginTop: 2 }}>DAILY LIMIT</p>
              </div>
            </div>
          </div>

          {/* SUGAR REPORT CARD */}
          <div style={{
            background: "#fff", borderRadius: 20,
            padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
            border: "1px solid #e8faf4"
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 16px" }}>
              SUGAR REPORT SUMMARY
            </p>

            {/* Fasting */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>🌙 Fasting Sugar</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: USER.fasting < 100 ? "#10b981" : USER.fasting < 126 ? "#f59e0b" : "#ef4444" }}>
                  {USER.fasting} mg/dL
                </span>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: `${Math.min((USER.fasting / 200) * 100, 100)}%`,
                  background: USER.fasting < 100 ? "#10b981" : USER.fasting < 126 ? "#f59e0b" : "#ef4444",
                  transition: "width 1s ease"
                }} />
              </div>
              <p style={{ fontSize: 10, color: "#9ca3af", margin: "4px 0 0" }}>Normal: &lt;100 mg/dL</p>
            </div>

            {/* Post meal */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>🍽️ Post-Meal (PP)</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: USER.postMeal < 140 ? "#10b981" : USER.postMeal < 200 ? "#f59e0b" : "#ef4444" }}>
                  {USER.postMeal} mg/dL
                </span>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 8, height: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: `${Math.min((USER.postMeal / 280) * 100, 100)}%`,
                  background: USER.postMeal < 140 ? "#10b981" : USER.postMeal < 200 ? "#f59e0b" : "#ef4444",
                  transition: "width 1s ease"
                }} />
              </div>
              <p style={{ fontSize: 10, color: "#9ca3af", margin: "4px 0 0" }}>Normal: &lt;140 mg/dL</p>
            </div>

            {/* Status */}
            <div style={{
              background: cfg.bg, border: `1px solid ${cfg.ring}`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 20 }}>
                {USER.status === "normal" ? "✅" : USER.status === "pre-diabetic" ? "⚠️" : "🔴"}
              </span>
              <div>
                <p style={{ fontWeight: 700, color: cfg.color, fontSize: 13, margin: 0 }}>
                  {cfg.label} Range
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                  {USER.status === "normal" ? "Keep it up!" :
                    USER.status === "pre-diabetic" ? "Control diet carefully" :
                      "Please consult doctor"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MEAL LOG CARD ── */}
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: "24px 20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
          border: "1px solid #e8faf4", marginBottom: 16
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#f0fdf4", borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {["today", "weekly"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
                background: activeTab === tab ? "#10b981" : "transparent",
                color: activeTab === tab ? "#fff" : "#6b7280",
                fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                transition: "all 0.2s"
              }}>
                {tab === "today" ? "Today's Meals" : "Weekly View"}
              </button>
            ))}
          </div>

          {activeTab === "today" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {meals.map(meal => (
                  <div key={meal.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px", background: "#f8fffe",
                    borderRadius: 14, border: "1px solid #e8faf4"
                  }}>
                    <span style={{ fontSize: 24, minWidth: 32, textAlign: "center" }}>{meal.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "#1f2937", margin: 0 }}>{meal.name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{meal.qty} · {meal.time}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        background: meal.sugar > 10 ? "#fef9c3" : "#ecfdf5",
                        color: meal.sugar > 10 ? "#ca8a04" : "#059669",
                        fontWeight: 700, fontSize: 13,
                        padding: "3px 10px", borderRadius: 20
                      }}>
                        +{meal.sugar}g
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: 14, paddingTop: 14, borderTop: "1px dashed #d1fae5"
              }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Total consumed</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#065f46" }}>{USER.consumed}g / {USER.dailyLimit}g</span>
              </div>
            </>
          )}

          {activeTab === "weekly" && (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 32, margin: 0 }}>📊</p>
              <p style={{ margin: "8px 0 0", fontSize: 13 }}>Weekly chart aayega — baad mein API connect hone par</p>
            </div>
          )}
        </div>

        {/* ── TIPS CARD ── */}
        <div style={{
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
          borderRadius: 20, padding: "20px", color: "#fff"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6ee7b7", margin: "0 0 10px" }}>
            💡 AI TIP FOR TODAY
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: "#d1fae5" }}>
            Aapki post-meal sugar thodi zyada hai. Aaj raat ke khane mein <strong style={{ color: "#fff" }}>white rice ki jagah brown rice</strong> try karein aur meethe se door rahein.
          </p>
        </div>

      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #e8faf4",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        height: 64, zIndex: 100,
        boxShadow: "0 -4px 20px rgba(16,185,129,0.08)"
      }}>
        {[
          { icon: "🏠", label: "Home", path: "/dashbord", active: true },
          { icon: "➕", label: "Add Meal", path: "/mealogger", active: false },
          { icon: "📋", label: "Reports", path: "/reports", active: false },
          { icon: "👤", label: "Profile", path: "/profile", active: false },
        ].map(item => (
          <button key={item.label} onClick={() => navigate(item.path)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, background: "none", border: "none", cursor: "pointer",
            padding: "6px 12px", borderRadius: 12,
            opacity: item.active ? 1 : 0.5
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: item.active ? 700 : 500,
              color: item.active ? "#10b981" : "#6b7280",
              fontFamily: "inherit", letterSpacing: 0.5
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

    </div>
  );
}