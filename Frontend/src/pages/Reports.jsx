import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ButtomNave from "../components/ButtomNave";

// ─────────────────────────────────────────────
// MOCK DATA — pichhle months ki reports
// Baad mein MongoDB se aayega
// ─────────────────────────────────────────────
const INITIAL_REPORTS = [
    { id: 1, month: "2025-03", fasting: 132, postMeal: 195, hba1c: 7.4 },
    { id: 2, month: "2025-02", fasting: 126, postMeal: 185, hba1c: 7.1 },
    { id: 3, month: "2025-01", fasting: 118, postMeal: 172, hba1c: 6.9 },
];

// ─────────────────────────────────────────────
// HELPER: month string ko readable banao
// "2025-03" → "March 2025"
// ─────────────────────────────────────────────
function formatMonth(monthStr) {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ─────────────────────────────────────────────
// HELPER: sugar level ka status
// ─────────────────────────────────────────────
function getFastingStatus(val) {
    if (val < 100) return { label: "Normal", color: "#10b981", bg: "#ecfdf5" };
    if (val < 126) return { label: "Pre-Diabetic", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "Diabetic", color: "#ef4444", bg: "#fef2f2" };
}
function getPostMealStatus(val) {
    if (val < 140) return { label: "Normal", color: "#10b981", bg: "#ecfdf5" };
    if (val < 200) return { label: "Pre-Diabetic", color: "#f59e0b", bg: "#fffbeb" };
    return { label: "Diabetic", color: "#ef4444", bg: "#fef2f2" };
}

// ─────────────────────────────────────────────
// HELPER: is month aur last month compare karo
// positive = worse (sugar badha), negative = better (sugar ghata)
// ─────────────────────────────────────────────
function getTrend(current, previous) {
    if (!previous) return null;
    const diff = current - previous;
    return {
        diff: Math.abs(diff).toFixed(0),
        better: diff < 0,   // sugar ghata = better
        same: diff === 0,
    };
}

// ─────────────────────────────────────────────
// CLAUDE AI SE COMPARISON LENA
// Do months ka data bhejo, AI analysis kare
// ─────────────────────────────────────────────
async function getAIComparison(current, previous) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{
                role: "user",
                content: `
Mujhe ek diabetic patient ki sugar report comparison chahiye.

Pichla mahina (${formatMonth(previous.month)}):
- Fasting: ${previous.fasting} mg/dL
- Post-Meal: ${previous.postMeal} mg/dL
- HbA1c: ${previous.hba1c || "N/A"}%

Is mahina (${formatMonth(current.month)}):
- Fasting: ${current.fasting} mg/dL
- Post-Meal: ${current.postMeal} mg/dL
- HbA1c: ${current.hba1c || "N/A"}%

Sirf JSON mein jawab do, koi extra text nahi:
{
  "verdict": "Better" ya "Worse" ya "Same",
  "fastingChange": "fasting ke baare mein ek line Hinglish mein",
  "postMealChange": "post-meal ke baare mein ek line Hinglish mein",
  "advice": "ek practical tip Hinglish mein",
  "emoji": "ek relevant emoji"
}`
            }]
        })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
}

// ─────────────────────────────────────────────
// TREND ARROW COMPONENT
// ─────────────────────────────────────────────
function TrendArrow({ trend }) {
    if (!trend) return null;
    if (trend.same) return <span style={{ fontSize: 12, color: "#9ca3af" }}>→ same</span>;
    return (
        <span style={{
            fontSize: 11, fontWeight: 700,
            color: trend.better ? "#10b981" : "#ef4444"
        }}>
            {trend.better ? "▼" : "▲"} {trend.diff} mg/dL
        </span>
    );
}

// ─────────────────────────────────────────────
// SINGLE REPORT CARD
// ─────────────────────────────────────────────
function ReportCard({ report, prevReport, isLatest }) {
    const fStatus = getFastingStatus(report.fasting);
    const pStatus = getPostMealStatus(report.postMeal);
    const fastingTrend = getTrend(report.fasting, prevReport?.fasting);
    const postMealTrend = getTrend(report.postMeal, prevReport?.postMeal);

    return (
        <div style={{
            background: "#fff",
            borderRadius: 20,
            padding: "20px",
            border: isLatest ? "2px solid #10b981" : "1px solid #e8faf4",
            boxShadow: isLatest
                ? "0 4px 24px rgba(16,185,129,0.13)"
                : "0 2px 12px rgba(16,185,129,0.05)",
            marginBottom: 14,
            position: "relative",
        }}>

            {/* Latest badge */}
            {isLatest && (
                <span style={{
                    position: "absolute", top: -10, left: 16,
                    background: "#10b981", color: "#fff",
                    fontSize: 9, fontWeight: 700, letterSpacing: 1,
                    padding: "3px 10px", borderRadius: 20
                }}>
                    LATEST
                </span>
            )}

            {/* Month header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 16, color: "#064e3b", margin: 0
                }}>
                    📅 {formatMonth(report.month)}
                </p>
                {report.hba1c && (
                    <span style={{
                        background: "#f0fdf4", color: "#065f46",
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 20,
                        border: "1px solid #bbf7d0"
                    }}>
                        HbA1c: {report.hba1c}%
                    </span>
                )}
            </div>

            {/* Fasting + PostMeal side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

                {/* Fasting */}
                <div style={{
                    background: fStatus.bg, borderRadius: 14,
                    padding: "14px", border: `1px solid ${fStatus.color}22`
                }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", margin: "0 0 4px", letterSpacing: 1 }}>
                        🌙 FASTING
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: fStatus.color, margin: 0 }}>
                        {report.fasting}
                    </p>
                    <p style={{ fontSize: 9, color: "#9ca3af", margin: "2px 0 6px" }}>mg/dL</p>
                    <span style={{
                        background: fStatus.color + "18",
                        color: fStatus.color,
                        fontSize: 9, fontWeight: 700,
                        padding: "2px 8px", borderRadius: 10
                    }}>
                        {fStatus.label}
                    </span>
                    <div style={{ marginTop: 6 }}>
                        <TrendArrow trend={fastingTrend} />
                    </div>
                </div>

                {/* Post Meal */}
                <div style={{
                    background: pStatus.bg, borderRadius: 14,
                    padding: "14px", border: `1px solid ${pStatus.color}22`
                }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", margin: "0 0 4px", letterSpacing: 1 }}>
                        🍽️ POST-MEAL
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: pStatus.color, margin: 0 }}>
                        {report.postMeal}
                    </p>
                    <p style={{ fontSize: 9, color: "#9ca3af", margin: "2px 0 6px" }}>mg/dL</p>
                    <span style={{
                        background: pStatus.color + "18",
                        color: pStatus.color,
                        fontSize: 9, fontWeight: 700,
                        padding: "2px 8px", borderRadius: 10
                    }}>
                        {pStatus.label}
                    </span>
                    <div style={{ marginTop: 6 }}>
                        <TrendArrow trend={postMealTrend} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Reports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState(INITIAL_REPORTS);
    const [showForm, setShowForm] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // New report form state
    const [form, setForm] = useState({
        month: "",
        fasting: "",
        postMeal: "",
        hba1c: "",
    });

    // Font load
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }, []);

    // ── FORM CHANGE ──
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ── NEW REPORT SUBMIT ──
    // 1. Reports list mein add karo
    // 2. AI se comparison lo (new vs previous latest)
    const handleSubmit = async () => {
        if (!form.month || !form.fasting || !form.postMeal) return;

        const newReport = {
            id: Date.now(),
            month: form.month,
            fasting: parseInt(form.fasting),
            postMeal: parseInt(form.postMeal),
            hba1c: form.hba1c ? parseFloat(form.hba1c) : null,
        };

        // Latest se pehle wala report previous hoga
        const previousReport = reports[0];

        // Naya report sabse upar add karo (latest first)
        const updatedReports = [newReport, ...reports];
        setReports(updatedReports);

        // Form reset + close
        setForm({ month: "", fasting: "", postMeal: "", hba1c: "" });
        setShowForm(false);

        // Success toast
        setSuccessMsg("✅ Report save ho gayi!");
        setTimeout(() => setSuccessMsg(""), 2500);

        // AI comparison — agar previous report hai tab
        if (previousReport) {
            setAiLoading(true);
            setAiResult(null);
            try {
                const result = await getAIComparison(newReport, previousReport);
                setAiResult(result);
            } catch (err) {
                console.error("AI error:", err);
            } finally {
                setAiLoading(false);
            }
        }

        // TODO: baad mein API call lagana
        // await axios.post("/api/reports/add", newReport);
    };

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
                    fontSize: 16, color: "#065f46", display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "inherit"
                }}>
                    ← <span style={{ fontFamily: "'DM Serif Display', serif" }}>Dashboard</span>
                </button>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#065f46" }}>
                    📋 Reports
                </span>
                <button
                    onClick={() => { setShowForm(!showForm); setAiResult(null); }}
                    style={{
                        background: showForm ? "#fef2f2" : "#10b981",
                        color: showForm ? "#ef4444" : "#fff",
                        border: "none", borderRadius: 20,
                        padding: "6px 14px", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit"
                    }}
                >
                    {showForm ? "✕ Cancel" : "+ Add Report"}
                </button>
            </nav>

            <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 100px" }}>

                {/* ── SUCCESS TOAST ── */}
                {successMsg && (
                    <div style={{
                        background: "#065f46", color: "#fff",
                        borderRadius: 14, padding: "12px 16px",
                        fontSize: 13, fontWeight: 600,
                        marginBottom: 16, textAlign: "center"
                    }}>
                        {successMsg}
                    </div>
                )}

                {/* ══════════════════════════════════════
            NEW REPORT FORM
        ══════════════════════════════════════ */}
                {showForm && (
                    <div style={{
                        background: "#fff", borderRadius: 20,
                        padding: "20px", border: "2px solid #10b981",
                        boxShadow: "0 4px 24px rgba(16,185,129,0.13)",
                        marginBottom: 20
                    }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 16px" }}>
                            NEW REPORT ADD KARO
                        </p>

                        {/* Month picker */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                📅 Report Month
                            </label>
                            <input
                                type="month"
                                name="month"
                                value={form.month}
                                onChange={handleChange}
                                style={{
                                    width: "100%", border: "1.5px solid #d1fae5",
                                    borderRadius: 12, padding: "10px 14px",
                                    fontSize: 14, fontFamily: "inherit",
                                    outline: "none", boxSizing: "border-box",
                                    background: "#f8fffe"
                                }}
                            />
                        </div>

                        {/* Fasting + PostMeal */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>

                            {/* Fasting */}
                            <div style={{ background: "#eff6ff", borderRadius: 14, padding: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", display: "block", marginBottom: 6 }}>
                                    🌙 Fasting Sugar
                                </label>
                                <p style={{ fontSize: 9, color: "#93c5fd", margin: "0 0 8px" }}>Subah khali pet</p>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        name="fasting"
                                        value={form.fasting}
                                        onChange={handleChange}
                                        placeholder="e.g. 110"
                                        style={{
                                            width: "100%", border: "1.5px solid #bfdbfe",
                                            borderRadius: 10, padding: "8px 36px 8px 10px",
                                            fontSize: 14, fontFamily: "inherit",
                                            outline: "none", boxSizing: "border-box",
                                            background: "#fff"
                                        }}
                                    />
                                    <span style={{ position: "absolute", right: 8, top: 9, fontSize: 10, color: "#93c5fd" }}>mg/dL</span>
                                </div>
                                {/* Live status */}
                                {form.fasting && (
                                    <p style={{
                                        fontSize: 10, fontWeight: 700, marginTop: 6,
                                        color: form.fasting < 100 ? "#10b981" : form.fasting < 126 ? "#f59e0b" : "#ef4444"
                                    }}>
                                        {form.fasting < 100 ? "✅ Normal" : form.fasting < 126 ? "⚠️ Pre-Diabetic" : "🔴 Diabetic"}
                                    </p>
                                )}
                            </div>

                            {/* PostMeal */}
                            <div style={{ background: "#fff7ed", borderRadius: 14, padding: 14 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", display: "block", marginBottom: 6 }}>
                                    🍽️ Post-Meal (PP)
                                </label>
                                <p style={{ fontSize: 9, color: "#fdba74", margin: "0 0 8px" }}>2 ghante baad</p>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        name="postMeal"
                                        value={form.postMeal}
                                        onChange={handleChange}
                                        placeholder="e.g. 145"
                                        style={{
                                            width: "100%", border: "1.5px solid #fed7aa",
                                            borderRadius: 10, padding: "8px 36px 8px 10px",
                                            fontSize: 14, fontFamily: "inherit",
                                            outline: "none", boxSizing: "border-box",
                                            background: "#fff"
                                        }}
                                    />
                                    <span style={{ position: "absolute", right: 8, top: 9, fontSize: 10, color: "#fdba74" }}>mg/dL</span>
                                </div>
                                {form.postMeal && (
                                    <p style={{
                                        fontSize: 10, fontWeight: 700, marginTop: 6,
                                        color: form.postMeal < 140 ? "#10b981" : form.postMeal < 200 ? "#f59e0b" : "#ef4444"
                                    }}>
                                        {form.postMeal < 140 ? "✅ Normal" : form.postMeal < 200 ? "⚠️ Pre-Diabetic" : "🔴 Diabetic"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* HbA1c optional */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                                📊 HbA1c % <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="hba1c"
                                    value={form.hba1c}
                                    onChange={handleChange}
                                    placeholder="e.g. 6.8"
                                    style={{
                                        width: "100%", border: "1.5px solid #d1fae5",
                                        borderRadius: 12, padding: "10px 40px 10px 14px",
                                        fontSize: 14, fontFamily: "inherit",
                                        outline: "none", boxSizing: "border-box",
                                        background: "#f8fffe"
                                    }}
                                />
                                <span style={{ position: "absolute", right: 12, top: 11, fontSize: 11, color: "#9ca3af" }}>%</span>
                            </div>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!form.month || !form.fasting || !form.postMeal}
                            style={{
                                width: "100%",
                                background: (!form.month || !form.fasting || !form.postMeal)
                                    ? "#e5e7eb" : "linear-gradient(135deg, #10b981, #059669)",
                                color: (!form.month || !form.fasting || !form.postMeal) ? "#9ca3af" : "#fff",
                                border: "none", borderRadius: 14,
                                padding: "14px", fontSize: 14, fontWeight: 700,
                                cursor: (!form.month || !form.fasting || !form.postMeal) ? "not-allowed" : "pointer",
                                fontFamily: "inherit", transition: "all 0.2s"
                            }}
                        >
                            💾 Save Report + AI Analysis
                        </button>
                    </div>
                )}

                {/* ══════════════════════════════════════
            AI COMPARISON RESULT
        ══════════════════════════════════════ */}

                {/* Loading */}
                {aiLoading && (
                    <div style={{
                        background: "#fff", borderRadius: 20, padding: "20px",
                        border: "1px solid #e8faf4", marginBottom: 16,
                        textAlign: "center"
                    }}>
                        <p style={{ fontSize: 24, margin: 0 }}>🤖</p>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "8px 0 0" }}>
                            AI compare kar raha hai last month se...
                        </p>
                    </div>
                )}

                {/* AI Result */}
                {aiResult && !aiLoading && (
                    <div style={{
                        background: aiResult.verdict === "Better"
                            ? "linear-gradient(135deg, #064e3b, #065f46)"
                            : aiResult.verdict === "Worse"
                                ? "linear-gradient(135deg, #7f1d1d, #991b1b)"
                                : "linear-gradient(135deg, #1e3a5f, #1e40af)",
                        borderRadius: 20, padding: "20px",
                        marginBottom: 16, color: "#fff"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <span style={{ fontSize: 28 }}>{aiResult.emoji}</span>
                            <div>
                                <p style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                                    AI ANALYSIS
                                </p>
                                <p style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: 18, margin: 0,
                                    color: aiResult.verdict === "Better" ? "#6ee7b7" :
                                        aiResult.verdict === "Worse" ? "#fca5a5" : "#93c5fd"
                                }}>
                                    {aiResult.verdict === "Better" ? "Improvement! 🎉" :
                                        aiResult.verdict === "Worse" ? "Dhyan Rakho ⚠️" : "Koi Change Nahi"}
                                </p>
                            </div>
                        </div>

                        {/* Fasting change */}
                        <div style={{
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 12, padding: "10px 14px", marginBottom: 8
                        }}>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "0 0 3px", letterSpacing: 1 }}>
                                FASTING
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.9)" }}>
                                {aiResult.fastingChange}
                            </p>
                        </div>

                        {/* PostMeal change */}
                        <div style={{
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 12, padding: "10px 14px", marginBottom: 12
                        }}>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "0 0 3px", letterSpacing: 1 }}>
                                POST-MEAL
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.9)" }}>
                                {aiResult.postMealChange}
                            </p>
                        </div>

                        {/* Advice */}
                        <div style={{
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: 12, padding: "10px 14px",
                            borderLeft: "3px solid rgba(255,255,255,0.4)"
                        }}>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "0 0 3px", letterSpacing: 1 }}>
                                💡 ADVICE
                            </p>
                            <p style={{ fontSize: 13, margin: 0, color: "#fff", fontWeight: 500 }}>
                                {aiResult.advice}
                            </p>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════
            MONTHLY HISTORY CARDS
        ══════════════════════════════════════ */}
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#9ca3af", margin: "0 0 12px" }}>
                    MONTHLY HISTORY
                </p>

                {reports.length === 0 ? (
                    <div style={{
                        background: "#fff", borderRadius: 20, padding: "40px 20px",
                        textAlign: "center", border: "1px solid #e8faf4"
                    }}>
                        <p style={{ fontSize: 32, margin: 0 }}>📋</p>
                        <p style={{ fontSize: 13, color: "#9ca3af", margin: "8px 0 0" }}>
                            Koi report nahi hai abhi — pehli report add karo!
                        </p>
                    </div>
                ) : (
                    reports.map((report, index) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            prevReport={reports[index + 1] || null}
                            isLatest={index === 0}
                        />
                    ))
                )}

            </div>

            {/* ── BOTTOM NAV ── */}
            <ButtomNave />
        </div>
    );
}