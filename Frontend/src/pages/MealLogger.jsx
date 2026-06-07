import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const MEAL_TIMES = [
  { id: "breakfast", label: "Breakfast", icon: "🥐" },
  { id: "lunch", label: "Lunch", icon: "🍛" },
  { id: "snack", label: "Snack", icon: "🍪" },
  { id: "dinner", label: "Dinner", icon: "🍽️" }
];

const INITIAL_MEALS = [];

async function fetchSugarFromAI(foodName) {
  const token = localStorage.getItem("token");
  const res   = await fetch("/api/meals/sugar-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ foodName })
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error || "AI se error aaya");
  }

  if (data.sugarPer === undefined || data.sugarPer === null || isNaN(Number(data.sugarPer))) {
    throw new Error("Sugar value nahi mili");
  }

  return data;
}

// Custom Quantity Selector - Dark Version
function QuantitySelector({ value, onChange, unit }) {
  const [hoverBtn, setHoverBtn] = useState(null);
  
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      background: "#0d1611",
      borderRadius: 14,
      overflow: "hidden",
      border: "1.5px solid #1a2e23",
      width: "fit-content"
    }}>
      <button
        onClick={() => onChange(Math.max(0.5, value - 0.5))}
        onMouseEnter={() => setHoverBtn("minus")}
        onMouseLeave={() => setHoverBtn(null)}
        style={{
          width: 46,
          height: 46,
          background: hoverBtn === "minus" ? "#1a2e23" : "none",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
          color: "#10b981",
          fontWeight: 700,
          transition: "background 0.2s"
        }}
      >
        −
      </button>
      <div style={{
        minWidth: 90,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: 46
      }}>
        <div>
          <span style={{
            fontWeight: 400,
            fontSize: 18,
            color: "#e8fdf4",
            fontFamily: "'DM Serif Display', serif"
          }}>
            {value}
          </span>
          <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>
            {unit}
          </span>
        </div>
      </div>
      <button
        onClick={() => onChange(value + 0.5)}
        onMouseEnter={() => setHoverBtn("plus")}
        onMouseLeave={() => setHoverBtn(null)}
        style={{
          width: 46,
          height: 46,
          background: hoverBtn === "plus" ? "#1a2e23" : "none",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
          color: "#10b981",
          fontWeight: 700,
          transition: "background 0.2s"
        }}
      >
        +
      </button>
    </div>
  );
}

export default function MealLogger() {
  const navigate = useNavigate();

  const [foodInput, setFoodInput] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedTime, setSelectedTime] = useState("lunch");
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [addedMsg, setAddedMsg] = useState("");
  const inputRef = useRef(null);

  // Hover/Focus States
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHover, setSearchHover] = useState(false);
  const [addHover, setAddHover] = useState(false);
  const [hoveredTimeBtn, setHoveredTimeBtn] = useState(null);
  const [hoveredDelete, setHoveredDelete] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const fetchTodayMeals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }
        
        const res = await fetch("/api/meals/today", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          localStorage.clear();
          navigate("/");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setMeals(data.meals || []);
        }
      } catch (err) {
        console.error("Failed to load today's meals:", err);
      }
    };
    fetchTodayMeals();
  }, [navigate]);

  const totalConsumed = meals.reduce((sum, m) => sum + m.totalSugar, 0);

  const handleSearch = async () => {
    if (!foodInput.trim()) return;

    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    setQuantity(1);

    try {
      const result = await fetchSugarFromAI(foodInput.trim());
      if (result.error) {
        setAiError(result.error);
      } else {
        setAiResult(result);
      }
    } catch (err) {
      setAiError(err.message || "AI se connect nahi ho paya. Dobara try karo.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!aiResult) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    const mealData = {
      name: foodInput.trim(),
      quantity: Number(quantity),
      unit: aiResult.unit,
      icon: aiResult.icon || "🍽️",
      sugarPer: Number(aiResult.sugarPer),
      totalSugar: Number(aiResult.sugarPer) * Number(quantity),
      mealTime: selectedTime
    };

    try {
      const res = await fetch("/api/meals/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(mealData)
      });

      const data = await res.json();
      if (!res.ok) {
        setAiError(data.message || "Meal save nahi ho paya");
        return;
      }

      setMeals(prev => [...prev, data.meal]);
      setFoodInput("");
      setAiResult(null);
      setQuantity(1);

      setAddedMsg(`${data.meal.icon} ${data.meal.name} add ho gaya! +${data.meal.totalSugar}g sugar`);
      setTimeout(() => setAddedMsg(""), 2500);

    } catch (err) {
      console.error(err);
      setAiError("Server error. Meal save nahi ho paya.");
    }
  };

  const handleDelete = async (mealId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        setMeals(prev => prev.filter(m => m._id !== mealId));
        setAddedMsg("Meal delete ho gaya!");
        setTimeout(() => setAddedMsg(""), 2000);
      } else {
        alert("Meal delete nahi ho paya");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error. Delete fail ho gaya.");
    }
  };

  const groupedMeals = MEAL_TIMES.reduce((acc, mt) => {
    const filtered = meals.filter(m => m.mealTime === mt.id);
    if (filtered.length > 0) acc[mt.id] = filtered;
    return acc;
  }, {});

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
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            gap: 8,
            outline: "none",
            padding: 0
          }}
        >
          ← <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#e8fdf4" }}>Dashboard</span>
        </button>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#e8fdf4" }}>
          🍽️ Meal Logger
        </span>
        <div style={{
          background: "#0d1f0d",
          borderRadius: 20,
          border: "1px solid #10b981",
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#34d399",
          boxShadow: "0 0 10px rgba(16,185,129,0.15)"
        }}>
          {totalConsumed.toFixed(1)}g consumed
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* TOAST NOTIFICATION */}
        {addedMsg && (
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20,
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
            animation: "fadeSlideUp 0.3s ease-out"
          }}>
            {addedMsg}
          </div>
        )}

        {/* FOOD SEARCH CARD */}
        <div style={{
          background: "#111814",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid #1a2e23",
          marginBottom: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 14px" }}>
            FOOD SEARCH
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="e.g. roti, biryani, chai..."
              style={{
                flex: 1,
                border: searchFocused ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
                borderRadius: 14,
                padding: "12px 16px",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                background: "#0d1611",
                color: "#e8fdf4",
                boxShadow: searchFocused ? "0 0 15px rgba(16,185,129,0.2)" : "none",
                transition: "all 0.2s"
              }}
            />
            <button
              onClick={handleSearch}
              onMouseEnter={() => setSearchHover(true)}
              onMouseLeave={() => setSearchHover(false)}
              disabled={aiLoading || !foodInput.trim()}
              style={{
                background: aiLoading
                  ? "#1a2e23"
                  : "linear-gradient(135deg, #10b981, #059669)",
                color: aiLoading ? "#6b7280" : "#fff",
                border: "none",
                borderRadius: 14,
                padding: "0 22px",
                fontSize: 13,
                fontWeight: 700,
                cursor: aiLoading || !foodInput.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                boxShadow: aiLoading || !foodInput.trim() ? "none" : (searchHover ? "0 4px 20px rgba(16,185,129,0.4)" : "0 4px 12px rgba(16,185,129,0.2)"),
                transform: searchHover && !aiLoading && foodInput.trim() ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s"
              }}
            >
              {aiLoading ? "⏳..." : "🔍 Search"}
            </button>
          </div>

          {/* AI Search Errors */}
          {aiError && (
            <div style={{
              marginTop: 14,
              background: "#1a0000",
              border: "1px solid #ef4444",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              color: "#f87171",
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(239,68,68,0.15)"
            }}>
              ❌ {aiError}
            </div>
          )}

          {/* AI Search Results Panel */}
          {aiResult && (
            <div style={{ marginTop: 20, animation: "fadeSlideUp 0.4s ease-out" }}>

              {/* Food Info Card */}
              <div style={{
                background: "#0d1611",
                borderRadius: 16,
                padding: "16px",
                marginBottom: 16,
                border: "1px solid #10b981",
                boxShadow: "0 0 20px rgba(16,185,129,0.12)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 32, filter: "drop-shadow(0 0 6px #10b981)" }}>{aiResult.icon}</span>
                    <div>
                      <p style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#e8fdf4",
                        margin: 0,
                        textTransform: "capitalize"
                      }}>
                        {foodInput}
                      </p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                        {aiResult.sugarPer}g sugar per {aiResult.unit}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontSize: 24,
                      fontWeight: 400,
                      fontFamily: "'DM Serif Display', serif",
                      color: "#10b981",
                      margin: 0,
                      textShadow: "0 0 8px rgba(16,185,129,0.3)"
                    }}>
                      {(Number(aiResult.sugarPer) * quantity).toFixed(1)}g
                    </p>
                    <p style={{ fontSize: 10, color: "#6b7280", margin: 0 }}>total sugar</p>
                  </div>
                </div>

                {/* AI advice note */}
                {aiResult.note && (
                  <p style={{
                    fontSize: 12,
                    color: "#34d399",
                    margin: "12px 0 0 0",
                    background: "rgba(16,185,129,0.06)",
                    borderLeft: "3px solid #10b981",
                    borderRadius: "4px 8px 8px 4px",
                    padding: "10px"
                  }}>
                    💡 {aiResult.note}
                  </p>
                )}
              </div>

              {/* Quantity Selector Panel */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 8px" }}>
                  Kitna khaya?
                </p>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  unit={aiResult.unit}
                />
              </div>

              {/* Meal Time Selector Grid */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 8px" }}>
                  Kab khaya?
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {MEAL_TIMES.map(mt => {
                    const isSelected = selectedTime === mt.id;
                    const isHovered = hoveredTimeBtn === mt.id;
                    return (
                      <button
                        key={mt.id}
                        onClick={() => setSelectedTime(mt.id)}
                        onMouseEnter={() => setHoveredTimeBtn(mt.id)}
                        onMouseLeave={() => setHoveredTimeBtn(null)}
                        style={{
                          padding: "12px 6px",
                          borderRadius: 14,
                          border: isSelected
                            ? "1.5px solid #10b981"
                            : (isHovered ? "1.5px solid #34d399" : "1.5px solid #1a2e23"),
                          background: isSelected
                            ? "rgba(16,185,129,0.06)"
                            : (isHovered ? "#162218" : "#0d1611"),
                          cursor: "pointer",
                          textAlign: "center",
                          outline: "none",
                          boxShadow: isSelected ? "0 0 12px rgba(16,185,129,0.15)" : "none",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ fontSize: 20 }}>{mt.icon}</div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isSelected ? "#10b981" : "#6b7280",
                          marginTop: 4
                        }}>
                          {mt.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Meal Button */}
              <button
                onClick={handleAddMeal}
                onMouseEnter={() => setAddHover(true)}
                onMouseLeave={() => setAddHover(false)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: addHover ? "0 4px 24px rgba(16,185,129,0.5)" : "0 4px 16px rgba(16,185,129,0.3)",
                  transform: addHover ? "scale(1.01)" : "scale(1)",
                  transition: "all 0.2s"
                }}
              >
                ➕ Add to Log — +{(Number(aiResult.sugarPer) * quantity).toFixed(1)}g sugar
              </button>
            </div>
          )}
        </div>

        {/* TODAY'S LOG LIST */}
        <div style={{
          background: "#111814",
          borderRadius: 20,
          padding: "20px",
          border: "1px solid #1a2e23",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: 0 }}>
              TODAY'S LOG
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>
              Total: {totalConsumed.toFixed(1)}g
            </span>
          </div>

          {meals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#6b7280" }}>
              <p style={{ fontSize: 36, margin: 0 }}>🍽️</p>
              <p style={{ margin: "10px 0 0", fontSize: 13 }}>Koi meal add nahi kiya abhi</p>
            </div>
          ) : (
            Object.entries(groupedMeals).map(([timeId, timeMeals]) => {
              const mt = MEAL_TIMES.find(x => x.id === timeId);
              const groupSugar = timeMeals.reduce((s, m) => s + m.totalSugar, 0);

              return (
                <div key={timeId} style={{ marginBottom: 20 }}>
                  {/* Group Section Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    paddingBottom: 8,
                    borderBottom: "1px dashed #1a2e23"
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#e8fdf4" }}>
                      {mt.icon} {mt.label}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{groupSugar.toFixed(1)}g sugar</span>
                  </div>

                  {/* Meals inside group */}
                  {timeMeals.map(meal => {
                    const isHigh = meal.totalSugar > 10;
                    return (
                      <div key={meal._id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: "#0d1611",
                        borderRadius: 14,
                        marginBottom: 10,
                        border: "1px solid #1a2e23"
                      }}>
                        <span style={{ fontSize: 24 }}>{meal.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#e8fdf4",
                            margin: 0,
                            textTransform: "capitalize"
                          }}>
                            {meal.name}
                          </p>
                          <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>
                            {meal.quantity} {meal.unit} × {meal.sugarPer}g
                          </p>
                        </div>
                        
                        {/* Sugar Status Badge */}
                        <span style={{
                          background: isHigh ? "#1a1200" : "#0d1f0d",
                          border: `1px solid ${isHigh ? "#f59e0b" : "#10b981"}`,
                          color: isHigh ? "#fbbf24" : "#34d399",
                          fontWeight: 700,
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 20,
                          marginRight: 6
                        }}>
                          {meal.totalSugar.toFixed(1)}g
                        </span>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(meal._id)}
                          onMouseEnter={() => setHoveredDelete(meal._id)}
                          onMouseLeave={() => setHoveredDelete(null)}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: hoveredDelete === meal._id ? "1px solid #ef4444" : "1px solid rgba(239,68,68,0.2)",
                            borderRadius: 10,
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {/* GRAND PROGRESS BAR CARD */}
          {meals.length > 0 && (
            <div style={{
              marginTop: 10,
              paddingTop: 16,
              borderTop: "2px dashed #1a2e23"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>Daily Progress</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                  {totalConsumed.toFixed(1)}g / 60g
                </span>
              </div>
              <div style={{ background: "#1a2e23", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  borderRadius: 99,
                  width: `${Math.min((totalConsumed / 60) * 100, 100)}%`,
                  background: totalConsumed > 60 ? "#ef4444" : totalConsumed > 48 ? "#f59e0b" : "#10b981",
                  boxShadow: `0 0 10px ${totalConsumed > 60 ? "rgba(239,68,68,0.4)" : totalConsumed > 48 ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)"}`,
                  transition: "width 0.5s ease, background 0.3s ease"
                }} />
              </div>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 0", textAlign: "right" }}>
                {Math.max(0, 60 - totalConsumed).toFixed(1)}g remaining
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}