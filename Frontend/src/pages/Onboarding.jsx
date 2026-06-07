import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper Functions
function calculateLimit(data) {
  if (data.fastingSugar >= 126 || data.postMealSugar >= 200) return 25;
  if (data.fastingSugar >= 100 || data.postMealSugar >= 140) return 35;
  return 50;
}

function getStatus(data) {
  if (data.fastingSugar >= 126 || data.postMealSugar >= 200) return "diabetic";
  if (data.fastingSugar >= 100 || data.postMealSugar >= 140) return "pre-diabetic";
  return "normal";
}

const steps = ["Personal Info", "Sugar Report", "Summary"];

const Onboarding = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fastingSugar: "",
    postMealSugar: "",
    hba1c: "",
    reportMonth: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Interactive UI states
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.height) {
        setError("Sab fields zaroori hain");
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.fastingSugar || !formData.postMealSugar) {
        setError("Fasting aur Post-Meal sugar zaroori hai");
        return;
      }
    }
    setError("");
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        navigate("/");
        return;
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId:          user.id,
          age:             Number(formData.age),
          gender:          formData.gender,
          weight:          Number(formData.weight),
          height:          Number(formData.height),
          lastFasting:     Number(formData.fastingSugar),
          lastPostMeal:    Number(formData.postMealSugar),
          dailySugarLimit: calculateLimit(formData),
          sugarStatus:     getStatus(formData),
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Kuch galat hua");
        return;
      }

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Server se connect nahi ho pa raha");
    } finally {
      setLoading(false);
    }
  };

  // Input styling generator helper
  const getInputStyle = (fieldName) => ({
    width: "100%",
    background: "#0d1611",
    border: focusedField === fieldName ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
    borderRadius: "14px",
    padding: "12px 16px",
    fontSize: "14px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    color: "#e8fdf4",
    boxShadow: focusedField === fieldName ? "0 0 15px rgba(16,185,129,0.2)" : "none",
    transition: "all 0.2s ease"
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f0d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#e8fdf4",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Decorative gradients */}
      <div style={{
        position: "absolute", top: -80, left: -80,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -80, right: -80,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Main Card */}
      <div style={{
        background: "#111814",
        borderRadius: 24,
        border: "1px solid #1a2e23",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        width: "full",
        maxWidth: 440,
        padding: "36px 30px",
        animation: "fadeSlideUp 0.5s ease-out",
        boxSizing: "border-box"
      }}>

        {/* Title */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 32,
          color: "#e8fdf4",
          textAlign: "center",
          margin: "0 0 4px 0",
          letterSpacing: 0.5
        }}>
          🩸 BSUGAR
        </h1>
        <p style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: 14,
          margin: "0 0 32px 0",
          fontWeight: 500
        }}>
          Smart Sugar Tracker Onboarding
        </p>

        {/* Progress Wizard Steps */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
          position: "relative"
        }}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div key={index} style={{ display: "flex", alignItems: "center", zIndex: 2 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  background: isCompleted || isActive
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "#0d1611",
                  color: isCompleted || isActive ? "#fff" : "#6b7280",
                  border: isCompleted || isActive ? "none" : "1.5px solid #1a2e23",
                  boxShadow: isActive ? "0 0 15px rgba(16,185,129,0.45)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  {isCompleted ? "✓" : index + 1}
                </div>
                
                <span style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#10b981" : "#6b7280",
                  display: "inline-block",
                  whiteSpace: "nowrap"
                }}>
                  {step}
                </span>

                {index < steps.length - 1 && (
                  <div style={{
                    height: 2,
                    width: 25,
                    marginLeft: 12,
                    marginRight: 4,
                    background: index < currentStep ? "#10b981" : "#1a2e23",
                    transition: "background 0.3s ease"
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            background: "#1a0000",
            border: "1px solid #ef4444",
            color: "#f87171",
            fontSize: 13,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 20,
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(239,68,68,0.15)",
            animation: "fadeSlideUp 0.3s ease-out"
          }}>
            ❌ {error}
          </div>
        )}

        {/* STEP 0 - Personal Information */}
        {currentStep === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              color: "#e8fdf4",
              margin: "0 0 8px 0",
              fontWeight: 400
            }}>
              👤 Personal Information
            </h2>

            <div>
              <input
                type="text"
                name="name"
                placeholder="Tumhara naam"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("name")}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                type="number"
                name="age"
                placeholder="Age (years)"
                value={formData.age}
                onChange={handleChange}
                onFocus={() => setFocusedField("age")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("age")}
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onFocus={() => setFocusedField("gender")}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...getInputStyle("gender"),
                  color: formData.gender ? "#e8fdf4" : "#6b7280",
                  cursor: "pointer"
                }}
              >
                <option value="" disabled style={{ background: "#111814", color: "#6b7280" }}>Gender</option>
                <option value="male" style={{ background: "#111814" }}>Male</option>
                <option value="female" style={{ background: "#111814" }}>Female</option>
                <option value="other" style={{ background: "#111814" }}>Other</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("weight")}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle("weight")}
                />
                <span style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#6b7280" }}>kg</span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  name="height"
                  placeholder="Height"
                  value={formData.height}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("height")}
                  onBlur={() => setFocusedField(null)}
                  style={getInputStyle("height")}
                />
                <span style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#6b7280" }}>cm</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 - Sugar Report Cards */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeIn 0.3s ease-out" }}>
            <div style={{ marginBottom: 6 }}>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                color: "#e8fdf4",
                margin: "0 0 4px 0",
                fontWeight: 400
              }}>
                🧪 Sugar Report
              </h2>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                Pichhle mahine ki report ke numbers daalo
              </p>
            </div>

            {/* Fasting (Dark Blue Tint Card) */}
            <div style={{
              background: "#0d1220",
              border: "1.5px solid #1e3a5f",
              borderRadius: 16,
              padding: 16
            }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd", display: "block", marginBottom: 4 }}>
                🌙 Fasting Sugar
              </label>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                Subah khali pet — test se pehle kuch nahi khaya
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  name="fastingSugar"
                  placeholder="e.g. 95"
                  value={formData.fastingSugar}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("fastingSugar")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...getInputStyle("fastingSugar"),
                    background: "#070b14",
                    border: focusedField === "fastingSugar" ? "1.5px solid #3b82f6" : "1.5px solid #1e3a5f",
                    boxShadow: focusedField === "fastingSugar" ? "0 0 12px rgba(59,130,246,0.3)" : "none"
                  }}
                />
                <span style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#6b7280" }}>mg/dL</span>
              </div>
              {formData.fastingSugar && (
                <p style={{
                  fontSize: 12, marginTop: 8, fontWeight: 600, marginBottom: 0,
                  color: formData.fastingSugar < 100 ? "#10b981" : formData.fastingSugar < 126 ? "#f59e0b" : "#ef4444"
                }}>
                  {formData.fastingSugar < 100 && "✅ Normal range"}
                  {formData.fastingSugar >= 100 && formData.fastingSugar < 126 && "⚠️ Pre-diabetic range"}
                  {formData.fastingSugar >= 126 && "🔴 Diabetic range"}
                </p>
              )}
            </div>

            {/* Post Meal (Dark Orange Tint Card) */}
            <div style={{
              background: "#1a0f00",
              border: "1.5px solid #78350f",
              borderRadius: 16,
              padding: 16
            }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#fdba74", display: "block", marginBottom: 4 }}>
                🍽️ Post-Meal Sugar (PP)
              </label>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                Khane ke 2 ghante baad ka reading
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  name="postMealSugar"
                  placeholder="e.g. 130"
                  value={formData.postMealSugar}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("postMealSugar")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...getInputStyle("postMealSugar"),
                    background: "#110a00",
                    border: focusedField === "postMealSugar" ? "1.5px solid #f59e0b" : "1.5px solid #78350f",
                    boxShadow: focusedField === "postMealSugar" ? "0 0 12px rgba(245,158,11,0.3)" : "none"
                  }}
                />
                <span style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#6b7280" }}>mg/dL</span>
              </div>
              {formData.postMealSugar && (
                <p style={{
                  fontSize: 12, marginTop: 8, fontWeight: 600, marginBottom: 0,
                  color: formData.postMealSugar < 140 ? "#10b981" : formData.postMealSugar < 200 ? "#f59e0b" : "#ef4444"
                }}>
                  {formData.postMealSugar < 140 && "✅ Normal range"}
                  {formData.postMealSugar >= 140 && formData.postMealSugar < 200 && "⚠️ Pre-diabetic range"}
                  {formData.postMealSugar >= 200 && "🔴 Diabetic range"}
                </p>
              )}
            </div>

            {/* HbA1c (Dark Purple Tint Card) */}
            <div style={{
              background: "#120d1a",
              border: "1.5px solid #4c1d95",
              borderRadius: 16,
              padding: 16
            }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd", display: "block", marginBottom: 4 }}>
                📊 HbA1c % <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span>
              </label>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                3 mahine ka average — report mein hota hai
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  step="0.1"
                  name="hba1c"
                  placeholder="e.g. 6.5"
                  value={formData.hba1c}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("hba1c")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...getInputStyle("hba1c"),
                    background: "#0c0812",
                    border: focusedField === "hba1c" ? "1.5px solid #8b5cf6" : "1.5px solid #4c1d95",
                    boxShadow: focusedField === "hba1c" ? "0 0 12px rgba(139,92,246,0.3)" : "none"
                  }}
                />
                <span style={{ position: "absolute", right: 12, top: 14, fontSize: 12, color: "#6b7280" }}>%</span>
              </div>
            </div>

            {/* Month selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, display: "block", marginBottom: 6 }}>
                REPORT MONTH
              </label>
              <input
                type="month"
                name="reportMonth"
                value={formData.reportMonth}
                onChange={handleChange}
                onFocus={() => setFocusedField("reportMonth")}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle("reportMonth")}
              />
            </div>
          </div>
        )}

        {/* STEP 2 - Summary Calculations */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.3s ease-out" }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              color: "#e8fdf4",
              margin: "0 0 8px 0",
              fontWeight: 400
            }}>
              ✅ Summary — Sab theek hai?
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Personal Info Summary */}
              <div style={{
                background: "#111814",
                border: "1px solid #1a2e23",
                borderRadius: 16,
                padding: 16
              }}>
                <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 10px 0", fontWeight: 700, letterSpacing: 1 }}>
                  PERSONAL INFO
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Naam:</span>
                  <span style={{ fontWeight: 600, color: "#e8fdf4" }}>{formData.name || "—"}</span>
                  <span style={{ color: "#6b7280" }}>Age:</span>
                  <span style={{ fontWeight: 600, color: "#e8fdf4" }}>{formData.age || "—"} yrs</span>
                  <span style={{ color: "#6b7280" }}>Gender:</span>
                  <span style={{ fontWeight: 600, color: "#e8fdf4", textTransform: "capitalize" }}>{formData.gender || "—"}</span>
                  <span style={{ color: "#6b7280" }}>Weight:</span>
                  <span style={{ fontWeight: 600, color: "#e8fdf4" }}>{formData.weight || "—"} kg</span>
                  <span style={{ color: "#6b7280" }}>Height:</span>
                  <span style={{ fontWeight: 600, color: "#e8fdf4" }}>{formData.height || "—"} cm</span>
                </div>
              </div>

              {/* Sugar Report Summary */}
              <div style={{
                background: "#111814",
                border: "1px solid #1a2e23",
                borderRadius: 16,
                padding: 16
              }}>
                <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 10px 0", fontWeight: 700, letterSpacing: 1 }}>
                  SUGAR REPORT
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Fasting:</span>
                  <span style={{ fontWeight: 600, color: "#93c5fd" }}>{formData.fastingSugar || "—"} mg/dL</span>
                  <span style={{ color: "#6b7280" }}>Post-Meal:</span>
                  <span style={{ fontWeight: 600, color: "#fdba74" }}>{formData.postMealSugar || "—"} mg/dL</span>
                  <span style={{ color: "#6b7280" }}>HbA1c:</span>
                  <span style={{ fontWeight: 600, color: "#c4b5fd" }}>{formData.hba1c ? `${formData.hba1c}%` : "—"}</span>
                </div>
              </div>

              {/* AI Calculated Limits */}
              <div style={{
                background: "rgba(16,185,129,0.06)",
                border: "1.5px solid #1a2e23",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 0 15px rgba(16,185,129,0.05)"
              }}>
                <p style={{ fontSize: 10, color: "#10b981", margin: "0 0 10px 0", fontWeight: 700, letterSpacing: 1 }}>
                  AI CALCULATED TARGETS
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Daily Limit:</span>
                  <span style={{ fontWeight: 800, color: "#10b981" }}>{calculateLimit(formData)}g sugar</span>
                  <span style={{ color: "#6b7280" }}>Status Range:</span>
                  <span style={{
                    fontWeight: 800, textTransform: "capitalize",
                    color: getStatus(formData) === "normal" ? "#34d399" : getStatus(formData) === "pre-diabetic" ? "#fbbf24" : "#f87171"
                  }}>
                    {getStatus(formData)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              onMouseEnter={() => setHoveredBtn("back")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex: 1,
                border: "1.5px solid #1a2e23",
                background: hoveredBtn === "back" ? "#162218" : "transparent",
                color: "#e8fdf4",
                padding: "13px 0",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              ← Back
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              onMouseEnter={() => setHoveredBtn("next")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                padding: "13px 0",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: hoveredBtn === "next" ? "0 4px 20px rgba(16,185,129,0.4)" : "0 4px 14px rgba(16,185,129,0.25)",
                transform: hoveredBtn === "next" ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s ease"
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              onMouseEnter={() => setHoveredBtn("submit")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex: 1,
                background: loading ? "#1a2e23" : "linear-gradient(135deg, #10b981, #059669)",
                color: loading ? "#6b7280" : "#fff",
                border: "none",
                padding: "13px 0",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : (hoveredBtn === "submit" ? "0 4px 24px rgba(16,185,129,0.5)" : "0 4px 14px rgba(16,185,129,0.25)"),
                transform: hoveredBtn === "submit" && !loading ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s ease"
              }}
            >
              {loading ? "⏳ Saving..." : "🚀 Start Tracking"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;