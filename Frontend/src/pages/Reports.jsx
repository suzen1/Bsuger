import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

function formatMonth(monthStr) {
    if (!monthStr) return "—";
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function getFastingStatus(val) {
    if (val < 100) return { label: "Normal", color: "#34d399", bg: "#0d1f0d", border: "#10b981" };
    if (val < 126) return { label: "Pre-Diabetic", color: "#fbbf24", bg: "#1a1200", border: "#f59e0b" };
    return { label: "Diabetic", color: "#f87171", bg: "#1a0000", border: "#ef4444" };
}

function getPostMealStatus(val) {
    if (val < 140) return { label: "Normal", color: "#34d399", bg: "#0d1f0d", border: "#10b981" };
    if (val < 200) return { label: "Pre-Diabetic", color: "#fbbf24", bg: "#1a1200", border: "#f59e0b" };
    return { label: "Diabetic", color: "#f87171", bg: "#1a0000", border: "#ef4444" };
}

function getTrend(current, previous) {
    if (previous === undefined || previous === null) return null;
    const diff = current - previous;
    return {
        diff: Math.abs(diff).toFixed(0),
        better: diff < 0, // sugar decrease = better
        same: diff === 0,
    };
}

async function getAIComparison(current, previous) {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/reports/ai-compare", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ current, previous })
    });
    
    if (!response.ok) {
        throw new Error("Backend comparison failed");
    }
    
    return await response.json();
}

// Trend Arrow Component with glows
function TrendArrow({ trend }) {
    if (!trend) return null;
    if (trend.same) return <span style={{ fontSize: 12, color: "#6b7280" }}>→ same</span>;
    const color = trend.better ? "#10b981" : "#ef4444";
    return (
        <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: color,
            textShadow: `0 0 6px ${color}`
        }}>
            {trend.better ? "▼" : "▲"} {trend.diff} mg/dL
        </span>
    );
}

// Single Report Card Redesign
function ReportCard({ report, prevReport, isLatest }) {
    const fastingVal = report.fastingSugar !== undefined ? report.fastingSugar : report.fasting;
    const postMealVal = report.postMealSugar !== undefined ? report.postMealSugar : report.postMeal;
    
    const prevFastingVal = prevReport ? (prevReport.fastingSugar !== undefined ? prevReport.fastingSugar : prevReport.fasting) : null;
    const prevPostMealVal = prevReport ? (prevReport.postMealSugar !== undefined ? prevReport.postMealSugar : prevReport.postMeal) : null;

    const fStatus = getFastingStatus(fastingVal);
    const pStatus = getPostMealStatus(postMealVal);
    const fastingTrend = getTrend(fastingVal, prevFastingVal);
    const postMealTrend = getTrend(postMealVal, prevPostMealVal);

    const [hover, setHover] = useState(false);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: "#111814",
                borderRadius: 20,
                padding: "20px",
                border: isLatest
                    ? "2.5px solid #10b981"
                    : (hover ? "1px solid #10b981" : "1px solid #1a2e23"),
                boxShadow: isLatest
                    ? "0 4px 24px rgba(16,185,129,0.3)"
                    : (hover ? "0 0 30px rgba(16,185,129,0.1)" : "0 4px 20px rgba(0,0,0,0.15)"),
                marginBottom: 20,
                position: "relative",
                transition: "all 0.3s ease",
                transform: hover ? "translateY(-2px)" : "translateY(0)"
            }}
        >
            {/* LATEST Badge with Green Gradient & Glow */}
            {isLatest && (
                <span style={{
                    position: "absolute", top: -11, left: 16,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#fff",
                    fontSize: 9, fontWeight: 800, letterSpacing: 1.2,
                    padding: "4px 12px", borderRadius: 20,
                    boxShadow: "0 2px 10px rgba(16,185,129,0.4)"
                }}>
                    LATEST
                </span>
            )}

            {/* Month Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 18, color: "#e8fdf4", margin: 0,
                    textShadow: "0 0 6px rgba(232,253,244,0.1)"
                }}>
                    📅 {formatMonth(report.month)}
                </p>
                {report.hba1c && (
                    <span style={{
                        background: "#120d1a",
                        color: "#c4b5fd",
                        fontSize: 11, fontWeight: 700,
                        padding: "4px 12px", borderRadius: 20,
                        border: "1px solid #4c1d95",
                        boxShadow: "0 0 10px rgba(139,92,246,0.1)"
                    }}>
                        HbA1c: {report.hba1c}%
                    </span>
                )}
            </div>

            {/* Fasting + PostMeal side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

                {/* Fasting (Dark Blue Tint Card) */}
                <div style={{
                    background: "#0d1220",
                    borderRadius: 16,
                    padding: "14px",
                    border: "1.5px solid #1e3a5f"
                }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#93c5fd", margin: "0 0 6px", letterSpacing: 1 }}>
                        🌙 FASTING
                    </p>
                    <p style={{
                        fontSize: 26,
                        fontFamily: "'DM Serif Display', serif",
                        color: fStatus.color,
                        margin: 0,
                        textShadow: `0 0 8px ${fStatus.color}44`
                    }}>
                        {fastingVal}
                    </p>
                    <p style={{ fontSize: 9, color: "#6b7280", margin: "2px 0 8px" }}>mg/dL</p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        <span style={{
                            background: fStatus.bg,
                            color: fStatus.color,
                            border: `1.5px solid ${fStatus.border}`,
                            fontSize: 10, fontWeight: 700,
                            padding: "2px 8px", borderRadius: 10
                        }}>
                            {fStatus.label}
                        </span>
                        <TrendArrow trend={fastingTrend} />
                    </div>
                </div>

                {/* Post Meal (Dark Orange Tint Card) */}
                <div style={{
                    background: "#1a0f00",
                    borderRadius: 16,
                    padding: "14px",
                    border: "1.5px solid #78350f"
                }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#fdba74", margin: "0 0 6px", letterSpacing: 1 }}>
                        🍽️ POST-MEAL
                    </p>
                    <p style={{
                        fontSize: 26,
                        fontFamily: "'DM Serif Display', serif",
                        color: pStatus.color,
                        margin: 0,
                        textShadow: `0 0 8px ${pStatus.color}44`
                    }}>
                        {postMealVal}
                    </p>
                    <p style={{ fontSize: 9, color: "#6b7280", margin: "2px 0 8px" }}>mg/dL</p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        <span style={{
                            background: pStatus.bg,
                            color: pStatus.color,
                            border: `1.5px solid ${pStatus.border}`,
                            fontSize: 10, fontWeight: 700,
                            padding: "2px 8px", borderRadius: 10
                        }}>
                            {pStatus.label}
                        </span>
                        <TrendArrow trend={postMealTrend} />
                    </div>
                </div>
            </div>
            
            {/* AI Notes inside Card */}
            {report.aiAdvice && (
                <div style={{
                    marginTop: 14,
                    background: "linear-gradient(135deg, #0d1f15 0%, #111814 100%)",
                    borderLeft: "3.5px solid #10b981",
                    borderRadius: "4px 10px 10px 4px",
                    padding: 12,
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)"
                }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#10b981", margin: "0 0 4px", letterSpacing: 0.5 }}>
                        🤖 AI VERDICT: {report.aiVerdict}
                    </p>
                    <p style={{ fontSize: 12, margin: 0, color: "#e8fdf4", lineHeight: 1.5, opacity: 0.9 }}>
                        {report.aiAdvice}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Reports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Form inputs state
    const [form, setForm] = useState({
        month: "",
        fasting: "",
        postMeal: "",
        hba1c: "",
    });

    // Focus & Hover states
    const [focusedField, setFocusedField] = useState(null);
    const [btnHover, setBtnHover] = useState(null);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/"); return; }

                const res = await fetch("/api/reports", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.clear();
                    navigate("/");
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setReports(data || []);
                }
            } catch (err) {
                console.error("Failed to load reports:", err);
            }
        };
        fetchReports();
    }, [navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.month || !form.fasting || !form.postMeal) return;

        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }

        const previousReport = reports[0];
        setForm({ month: "", fasting: "", postMeal: "", hba1c: "" });
        setShowForm(false);

        let comparisonResult = null;
        if (previousReport) {
            setAiLoading(true);
            setAiResult(null);
            try {
                comparisonResult = await getAIComparison(
                    { fasting: parseInt(form.fasting), postMeal: parseInt(form.postMeal), month: form.month, hba1c: form.hba1c },
                    previousReport
                );
                setAiResult(comparisonResult);
            } catch (err) {
                console.error("AI comparison failed:", err);
            } finally {
                setAiLoading(false);
            }
        }

        try {
            const res = await fetch("/api/reports/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    month: form.month,
                    fastingSugar: Number(form.fasting),
                    postMealSugar: Number(form.postMeal),
                    hba1c: form.hba1c ? Number(form.hba1c) : null,
                    aiVerdict: comparisonResult?.verdict || "Same",
                    aiFastingNote: comparisonResult?.fastingChange || "",
                    aiPostMealNote: comparisonResult?.postMealChange || "",
                    aiAdvice: comparisonResult?.advice || ""
                })
            });

            if (res.ok) {
                const savedReport = await res.json();
                setReports(prev => [savedReport, ...prev]);
                setSuccessMsg("✅ Report save ho gayi!");
                setTimeout(() => setSuccessMsg(""), 2500);
            } else {
                console.error("Failed to save report to database");
            }
        } catch (err) {
            console.error("Failed to save report:", err);
        }
    };

    const getInputStyle = (name) => ({
        width: "100%",
        border: focusedField === name ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        background: "#0d1611",
        color: "#e8fdf4",
        boxShadow: focusedField === name ? "0 0 12px rgba(16,185,129,0.2)" : "none",
        transition: "all 0.2s"
    });

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
                    📋 Reports
                </span>
                <button
                    onClick={() => { setShowForm(!showForm); setAiResult(null); }}
                    onMouseEnter={() => setBtnHover("toggleForm")}
                    onMouseLeave={() => setBtnHover(null)}
                    style={{
                        background: showForm
                            ? "rgba(239,68,68,0.15)"
                            : "linear-gradient(135deg, #10b981, #059669)",
                        color: showForm ? "#ef4444" : "#fff",
                        border: showForm ? "1px solid #ef4444" : "none",
                        borderRadius: 20,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: showForm ? "none" : (btnHover === "toggleForm" ? "0 2px 15px rgba(16,185,129,0.4)" : "0 2px 8px rgba(16,185,129,0.2)"),
                        transform: btnHover === "toggleForm" ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.2s"
                    }}
                >
                    {showForm ? "✕ Cancel" : "+ Add Report"}
                </button>
            </nav>

            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 100px" }}>

                {/* TOAST SUCCESS */}
                {successMsg && (
                    <div style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff",
                        borderRadius: 14,
                        padding: "12px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 20,
                        textAlign: "center",
                        boxShadow: "0 4px 20px rgba(16,185,129,0.3)"
                    }}>
                        {successMsg}
                    </div>
                )}

                {/* NEW REPORT FORM CARD */}
                {showForm && (
                    <div style={{
                        background: "#111814",
                        borderRadius: 20,
                        padding: "20px",
                        border: "2px solid #10b981",
                        boxShadow: "0 4px 24px rgba(16,185,129,0.25)",
                        marginBottom: 24,
                        animation: "fadeSlideUp 0.4s ease-out"
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 16px" }}>
                            NEW REPORT ADD KARO
                        </p>

                        {/* Month */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>
                                📅 Report Month
                            </label>
                            <input
                                type="month"
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                onFocus={() => setFocusedField("month")}
                                onBlur={() => setFocusedField(null)}
                                style={getInputStyle("month")}
                            />
                        </div>

                        {/* Fasting & Post Meal inputs */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>

                            {/* Fasting input */}
                            <div style={{ background: "#0d1220", border: "1.5px solid #1e3a5f", borderRadius: 16, padding: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", display: "block", marginBottom: 4 }}>
                                    🌙 Fasting Sugar
                                </label>
                                <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 8px" }}>Subah khali pet</p>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        name="fasting"
                                        value={form.fasting}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("fasting")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="e.g. 110"
                                        style={{
                                            ...getInputStyle("fasting"),
                                            background: "#070b14",
                                            border: focusedField === "fasting" ? "1.5px solid #3b82f6" : "1.5px solid #1e3a5f",
                                            boxShadow: focusedField === "fasting" ? "0 0 10px rgba(59,130,246,0.2)" : "none"
                                        }}
                                    />
                                    <span style={{ position: "absolute", right: 8, top: 12, fontSize: 10, color: "#6b7280" }}>mg/dL</span>
                                </div>
                                {form.fasting && (
                                    <p style={{
                                        fontSize: 10, fontWeight: 700, marginTop: 6, marginBottom: 0,
                                        color: form.fasting < 100 ? "#10b981" : form.fasting < 126 ? "#f59e0b" : "#ef4444"
                                    }}>
                                        {form.fasting < 100 ? "✅ Normal" : form.fasting < 126 ? "⚠️ Pre-Diabetic" : "🔴 Diabetic"}
                                    </p>
                                )}
                            </div>

                            {/* PostMeal input */}
                            <div style={{ background: "#1a0f00", border: "1.5px solid #78350f", borderRadius: 16, padding: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#fdba74", display: "block", marginBottom: 4 }}>
                                    🍽️ Post-Meal (PP)
                                </label>
                                <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 8px" }}>2 ghante baad</p>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        name="postMeal"
                                        value={form.postMeal}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField("postMeal")}
                                        onBlur={() => setFocusedField(null)}
                                        placeholder="e.g. 145"
                                        style={{
                                            ...getInputStyle("postMeal"),
                                            background: "#110a00",
                                            border: focusedField === "postMeal" ? "1.5px solid #f59e0b" : "1.5px solid #78350f",
                                            boxShadow: focusedField === "postMeal" ? "0 0 10px rgba(245,158,11,0.2)" : "none"
                                        }}
                                    />
                                    <span style={{ position: "absolute", right: 8, top: 12, fontSize: 10, color: "#6b7280" }}>mg/dL</span>
                                </div>
                                {form.postMeal && (
                                    <p style={{
                                        fontSize: 10, fontWeight: 700, marginTop: 6, marginBottom: 0,
                                        color: form.postMeal < 140 ? "#10b981" : form.postMeal < 200 ? "#f59e0b" : "#ef4444"
                                    }}>
                                        {form.postMeal < 140 ? "✅ Normal" : form.postMeal < 200 ? "⚠️ Pre-Diabetic" : "🔴 Diabetic"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* HbA1c optional */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>
                                📊 HbA1c % <span style={{ color: "#6b7280", fontWeight: 400 }}>(optional)</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="hba1c"
                                    value={form.hba1c}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField("hba1c")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="e.g. 6.8"
                                    style={getInputStyle("hba1c")}
                                />
                                <span style={{ position: "absolute", right: 12, top: 12, fontSize: 11, color: "#6b7280" }}>%</span>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!form.month || !form.fasting || !form.postMeal}
                            onMouseEnter={() => setBtnHover("save")}
                            onMouseLeave={() => setBtnHover(null)}
                            style={{
                                width: "100%",
                                background: (!form.month || !form.fasting || !form.postMeal)
                                    ? "#1a2e23"
                                    : "linear-gradient(135deg, #10b981, #059669)",
                                color: (!form.month || !form.fasting || !form.postMeal) ? "#6b7280" : "#fff",
                                border: "none",
                                borderRadius: 14,
                                padding: "14px",
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: (!form.month || !form.fasting || !form.postMeal) ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                                boxShadow: (!form.month || !form.fasting || !form.postMeal) ? "none" : (btnHover === "save" ? "0 4px 20px rgba(16,185,129,0.4)" : "0 4px 12px rgba(16,185,129,0.2)"),
                                transform: (btnHover === "save" && form.month && form.fasting && form.postMeal) ? "scale(1.01)" : "scale(1)",
                                transition: "all 0.2s"
                            }}
                        >
                            💾 Save Report + AI Analysis
                        </button>
                    </div>
                )}

                {/* AI COMPARISON RESULT CARD */}
                {aiLoading && (
                    <div style={{
                        background: "#111814",
                        borderRadius: 20,
                        padding: "24px 20px",
                        border: "1px solid #1a2e23",
                        marginBottom: 20,
                        textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                    }}>
                        <p style={{ fontSize: 32, margin: 0, animation: "float 2s infinite ease-in-out" }}>🤖</p>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "10px 0 0", fontWeight: 500 }}>
                            AI compare kar raha hai last month se...
                        </p>
                    </div>
                )}

                {aiResult && !aiLoading && (
                    <div style={{
                        background: "linear-gradient(135deg, #0d1f15 0%, #111814 100%)",
                        borderRadius: 20,
                        padding: "20px",
                        marginBottom: 20,
                        border: "1px solid #1a2e23",
                        borderLeft: "4px solid #8b5cf6",
                        color: "#e8fdf4",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                        animation: "fadeSlideUp 0.4s ease-out"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 32 }}>{aiResult.emoji}</span>
                            <div>
                                <p style={{ fontSize: 10, letterSpacing: 2, color: "#6b7280", margin: 0, fontWeight: 700 }}>
                                    AI ANALYSIS
                                </p>
                                <p style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: 20,
                                    margin: "2px 0 0 0",
                                    color: aiResult.verdict === "Better" ? "#10b981" :
                                           aiResult.verdict === "Worse" ? "#ef4444" : "#06b6d4"
                                }}>
                                    {aiResult.verdict === "Better" ? "Improvement! 🎉" :
                                     aiResult.verdict === "Worse" ? "Dhyan Rakho ⚠️" : "Koi Change Nahi"}
                                </p>
                            </div>
                        </div>

                        {/* Fasting change */}
                        <div style={{
                            background: "#0d1611",
                            border: "1px solid #1a2e23",
                            borderRadius: 14,
                            padding: "12px 14px",
                            marginBottom: 10
                        }}>
                            <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 4px", fontWeight: 700, letterSpacing: 0.8 }}>
                                FASTING CHANGES
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "#e8fdf4", opacity: 0.9 }}>
                                {aiResult.fastingChange}
                            </p>
                        </div>

                        {/* PostMeal change */}
                        <div style={{
                            background: "#0d1611",
                            border: "1px solid #1a2e23",
                            borderRadius: 14,
                            padding: "12px 14px",
                            marginBottom: 14
                        }}>
                            <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 4px", fontWeight: 700, letterSpacing: 0.8 }}>
                                POST-MEAL CHANGES
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "#e8fdf4", opacity: 0.9 }}>
                                {aiResult.postMealChange}
                            </p>
                        </div>

                        {/* Advice */}
                        <div style={{
                            background: "rgba(139,92,246,0.06)",
                            border: "1px solid rgba(139,92,246,0.15)",
                            borderRadius: 14,
                            padding: "12px 14px",
                            borderLeft: "3.5px solid #8b5cf6"
                        }}>
                            <p style={{ fontSize: 10, color: "#8b5cf6", margin: "0 0 4px", fontWeight: 700, letterSpacing: 0.8 }}>
                                💡 AI ADVICE
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "#e8fdf4", fontWeight: 500 }}>
                                {aiResult.advice}
                            </p>
                        </div>
                    </div>
                )}

                {/* MONTHLY HISTORY LIST */}
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6b7280", margin: "0 0 16px" }}>
                    MONTHLY HISTORY
                </p>

                {reports.length === 0 ? (
                    <div style={{
                        background: "#111814",
                        borderRadius: 20,
                        padding: "40px 20px",
                        textAlign: "center",
                        border: "1px solid #1a2e23",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                    }}>
                        <p style={{ fontSize: 36, margin: 0 }}>📋</p>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "10px 0 0" }}>
                            Koi report nahi hai abhi — pehli report add karo!
                        </p>
                    </div>
                ) : (
                    reports.map((report, index) => (
                        <ReportCard
                            key={report._id || report.id}
                            report={report}
                            prevReport={reports[index + 1] || null}
                            isLatest={index === 0}
                        />
                    ))
                )}

            </div>

            <BottomNav />
        </div>
    );
}