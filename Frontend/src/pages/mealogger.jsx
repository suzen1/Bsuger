import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ButtomNave from "../components/ButtomNave";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MEAL_TIMES = [
  { id: "breakfast", label: "Breakfast", icon: "🥐" },
  { id: "lunch", label: "Lunch", icon: "🍛" },
  { id: "snack", label: "Snack", icon: "🍪" },
  { id: "dinner", label: "Dinner", icon: "🍽️" }
];

const INITIAL_MEALS = [];

// Token helper — har request mein chahiye
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// ─────────────────────────────────────────────
// CLAUDE AI se sugar fetch karne ka function
// ─────────────────────────────────────────────
async function fetchSugarFromAI(foodName) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Food item: "${foodName}"
        
Mujhe sirf JSON mein jawab do, koi extra text nahi:
{
  "sugarPer": <1 serving mein sugar grams as number>,
  "unit": <serving unit, e.g. "piece", "cup", "plate", "bowl">,
  "icon": <1 relevant emoji>,
  "note": <ek line mein short tip Hinglish mein>
}

Agar food item samajh nahi aaya toh:
{ "error": "Food samajh nahi aaya" }`
      }]
    })
  });

  const data = await response.json();
  // Claude ka response text extract karo
  const text = data.content?.[0]?.text || "";
  // JSON parse karo — backticks ya extra text hata ke
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─────────────────────────────────────────────
// QUANTITY SELECTOR COMPONENT
// + aur - buttons se quantity badho/ghato
// ─────────────────────────────────────────────
function QuantitySelector({ value, onChange, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#f0fdf4", borderRadius: 14, overflow: "hidden", border: "1.5px solid #bbf7d0" }}>
      <button
        onClick={() => onChange(Math.max(0.5, value - 0.5))}
        style={{ width: 44, height: 44, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#065f46", fontWeight: 700 }}
      >−</button>
      <div style={{ minWidth: 70, textAlign: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#065f46" }}>{value}</span>
        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>{unit}</span>
      </div>
      <button
        onClick={() => onChange(value + 0.5)}
        style={{ width: 44, height: 44, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#065f46", fontWeight: 700 }}
      >+</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function MealLogger() {
  const navigate = useNavigate();

  // ── STATES ──
  const [foodInput, setFoodInput] = useState("");       // user jo type kar raha hai
  const [aiResult, setAiResult] = useState(null);     // Claude ka jawab
  const [aiLoading, setAiLoading] = useState(false);    // loading spinner
  const [aiError, setAiError] = useState("");       // error message
  const [quantity, setQuantity] = useState(1);        // kitna khaya
  const [selectedTime, setSelectedTime] = useState("lunch"); // konsa waqt
  const [meals, setMeals] = useState(INITIAL_MEALS); // aaj ke meals
  const [addedMsg, setAddedMsg] = useState("");        // success toast
  const inputRef = useRef(null);

  // Font load
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // ── TOTAL SUGAR calculate karo har baar meals badlein ──
  // reduce() — har meal ka totalSugar ek saath jodo
  const totalConsumed = meals.reduce((sum, m) => sum + m.totalSugar, 0);

  // ── STEP 1: Food Search ──
  // User Enter dabaye ya Search button click kare
  const handleSearch = async () => {
    if (!foodInput.trim()) return;

    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    setQuantity(1); // quantity reset

    try {
      const result = await fetchSugarFromAI(foodInput.trim());
      if (result.error) {
        setAiError(result.error);
      } else {
        setAiResult(result); // Claude ka result save karo
      }
    } catch (err) {
      setAiError("AI se connect nahi ho paya. Dobara try karo.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── STEP 2: Meal Add Karo ──
  // Jab "Add to Log" click ho
  const handleAddMeal = () => {
    if (!aiResult) return;

    // Naya meal object banao
    const newMeal = {
      id: Date.now(),                           // unique ID
      name: foodInput,
      qty: quantity,
      unit: aiResult.unit,
      sugarPer: aiResult.sugarPer,              // per unit sugar
      totalSugar: aiResult.sugarPer * quantity, // TOTAL = per unit × quantity
      mealTime: selectedTime,
      icon: aiResult.icon,
    };

    // Meals list mein add karo
    setMeals([...meals, newMeal]);

    // Form reset karo
    setFoodInput("");
    setAiResult(null);
    setQuantity(1);

    // Success message 2 second ke liye dikhao
    setAddedMsg(`${newMeal.icon} ${newMeal.name} add ho gaya! +${newMeal.totalSugar}g sugar`);
    setTimeout(() => setAddedMsg(""), 2500);

    // TODO: yahan baad mein API call lagegi
    // await axios.post("/api/meals/add", newMeal);
  };

  // ── Meal Delete ──
  const handleDelete = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  // ── Meal time ke hisaab se group karo ──
  // { breakfast: [...], lunch: [...] } aisa object banta hai
  const groupedMeals = MEAL_TIMES.reduce((acc, mt) => {
    const filtered = meals.filter(m => m.mealTime === mt.id);
    if (filtered.length > 0) acc[mt.id] = filtered;
    return acc;
  }, {});

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fffe", minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e8faf4",
        padding: "0 20px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(16,185,129,0.07)"
      }}>
        <button onClick={() => navigate("/dashboard")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 20, color: "#065f46", display: "flex", alignItems: "center", gap: 6
        }}>
          ← <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16 }}>Dashboard</span>
        </button>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#065f46" }}>
          🍽️ Meal Logger
        </span>
        {/* Aaj ka total */}
        <div style={{
          background: "#ecfdf5", borderRadius: 20,
          padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#065f46"
        }}>
          {totalConsumed}g today
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* ── SUCCESS TOAST ── */}
        {addedMsg && (
          <div style={{
            background: "#065f46", color: "#fff",
            borderRadius: 14, padding: "12px 16px",
            fontSize: 13, fontWeight: 600, marginBottom: 16,
            textAlign: "center", animation: "fadeIn 0.3s ease"
          }}>
            ✅ {addedMsg}
          </div>
        )}

        {/* ══════════════════════════════════════
            FOOD SEARCH CARD
        ══════════════════════════════════════ */}
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: "20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
          border: "1px solid #e8faf4", marginBottom: 16
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 14px" }}>
            FOOD SEARCH
          </p>

          {/* Search Input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="e.g. roti, biryani, chai..."
              style={{
                flex: 1, border: "1.5px solid #d1fae5",
                borderRadius: 14, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", background: "#f8fffe"
              }}
            />
            <button
              onClick={handleSearch}
              disabled={aiLoading || !foodInput.trim()}
              style={{
                background: aiLoading ? "#9ca3af" : "#10b981",
                color: "#fff", border: "none",
                borderRadius: 14, padding: "0 20px",
                fontSize: 13, fontWeight: 700,
                cursor: aiLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap"
              }}
            >
              {aiLoading ? "⏳..." : "🔍 Search"}
            </button>
          </div>

          {/* ── AI ERROR ── */}
          {aiError && (
            <div style={{ marginTop: 12, background: "#fef2f2", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              ❌ {aiError}
            </div>
          )}

          {/* ── AI RESULT ── */}
          {aiResult && (
            <div style={{ marginTop: 14 }}>

              {/* Food info box */}
              <div style={{
                background: "#f0fdf4", borderRadius: 14,
                padding: "14px 16px", marginBottom: 14,
                border: "1.5px solid #bbf7d0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>{aiResult.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: "#065f46", margin: 0, textTransform: "capitalize" }}>
                        {foodInput}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                        {aiResult.sugarPer}g sugar per {aiResult.unit}
                      </p>
                    </div>
                  </div>
                  {/* Live total */}
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#10b981", margin: 0 }}>
                      {(aiResult.sugarPer * quantity).toFixed(1)}g
                    </p>
                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>total sugar</p>
                  </div>
                </div>

                {/* AI tip */}
                {aiResult.note && (
                  <p style={{
                    fontSize: 12, color: "#065f46", margin: "10px 0 0",
                    background: "#dcfce7", borderRadius: 8, padding: "8px 10px"
                  }}>
                    💡 {aiResult.note}
                  </p>
                )}
              </div>

              {/* ── QUANTITY SELECTOR ── */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
                  Kitna khaya?
                </p>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  unit={aiResult.unit}
                />
              </div>

              {/* ── MEAL TIME SELECTOR ── */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 8px" }}>
                  Kab khaya?
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  {MEAL_TIMES.map(mt => (
                    <button
                      key={mt.id}
                      onClick={() => setSelectedTime(mt.id)}
                      style={{
                        padding: "10px 4px",
                        borderRadius: 12,
                        border: selectedTime === mt.id ? "2px solid #10b981" : "1.5px solid #e5e7eb",
                        background: selectedTime === mt.id ? "#ecfdf5" : "#fff",
                        cursor: "pointer", textAlign: "center",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ fontSize: 18 }}>{mt.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: selectedTime === mt.id ? "#065f46" : "#6b7280", marginTop: 2 }}>
                        {mt.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── ADD BUTTON ── */}
              <button
                onClick={handleAddMeal}
                style={{
                  width: "100%", background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", border: "none", borderRadius: 14,
                  padding: "14px", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                ➕ Add to Log — +{(aiResult.sugarPer * quantity).toFixed(1)}g sugar
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            TODAY'S MEAL LIST — grouped by time
        ══════════════════════════════════════ */}
        <div style={{
          background: "#fff", borderRadius: 20,
          padding: "20px", boxShadow: "0 2px 20px rgba(16,185,129,0.08)",
          border: "1px solid #e8faf4"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: 0 }}>
              TODAY'S LOG
            </p>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>
              Total: {totalConsumed}g
            </span>
          </div>

          {meals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 32, margin: 0 }}>🍽️</p>
              <p style={{ margin: "8px 0 0", fontSize: 13 }}>Koi meal add nahi kiya abhi</p>
            </div>
          ) : (
            /* Har meal time ka group */
            Object.entries(groupedMeals).map(([timeId, timeMeals]) => {
              const mt = MEAL_TIMES.find(x => x.id === timeId);
              const groupSugar = timeMeals.reduce((s, m) => s + m.totalSugar, 0);

              return (
                <div key={timeId} style={{ marginBottom: 16 }}>
                  {/* Group header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 8,
                    paddingBottom: 6, borderBottom: "1px dashed #d1fae5"
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                      {mt.icon} {mt.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{groupSugar}g sugar</span>
                  </div>

                  {/* Meals in this group */}
                  {timeMeals.map(meal => (
                    <div key={meal.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", background: "#f8fffe",
                      borderRadius: 12, marginBottom: 8,
                      border: "1px solid #e8faf4"
                    }}>
                      <span style={{ fontSize: 22 }}>{meal.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#1f2937", margin: 0, textTransform: "capitalize" }}>
                          {meal.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                          {meal.qty} {meal.unit} × {meal.sugarPer}g
                        </p>
                      </div>
                      <span style={{
                        background: meal.totalSugar > 10 ? "#fef9c3" : "#ecfdf5",
                        color: meal.totalSugar > 10 ? "#ca8a04" : "#059669",
                        fontWeight: 700, fontSize: 13,
                        padding: "3px 10px", borderRadius: 20,
                        marginRight: 6
                      }}>
                        {meal.totalSugar}g
                      </span>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(meal.id)}
                        style={{
                          background: "#fef2f2", border: "none",
                          borderRadius: 8, width: 28, height: 28,
                          cursor: "pointer", fontSize: 13,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {/* ── GRAND TOTAL BAR ── */}
          {meals.length > 0 && (
            <div style={{
              marginTop: 8, paddingTop: 14,
              borderTop: "2px dashed #bbf7d0"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Daily Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                  {totalConsumed}g / 60g
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ background: "#f0fdf4", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  width: `${Math.min((totalConsumed / 60) * 100, 100)}%`,
                  background: totalConsumed > 60 ? "#ef4444" : totalConsumed > 48 ? "#f59e0b" : "#10b981",
                  transition: "width 0.5s ease, background 0.3s ease"
                }} />
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0", textAlign: "right" }}>
                {Math.max(0, 60 - totalConsumed)}g remaining
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <ButtomNave />
    </div>
  );
}