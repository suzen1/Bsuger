import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setShow(true), 50);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

const handleSubmit = async () => {
  // Validation
  if (!form.email || !form.password) {
    setError("Email aur password zaroori hai");
    return;
  }
  if (!isLogin && !form.name) {
    setError("Naam zaroori hai");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Kuch galat hua");
      return;
    }

    // Save karo
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Navigate karo
    if (isLogin) {
      navigate("/onbording");
    } else {
      navigate("/dashbord");
    }

  } catch (err) {
    setError("Server se connect nahi ho pa raha");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif",
      background: "#f0fdf8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background blobs */}
      <div style={{
        position: "absolute", top: -80, right: -80,
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
        opacity: 0.5, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -100, left: -60,
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
        opacity: 0.35, pointerEvents: "none"
      }} />

      {/* Card */}
      <div style={{
        background: "#fff",
        borderRadius: 28,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 8px 48px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #d1fae5",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 18, margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, boxShadow: "0 4px 16px rgba(16,185,129,0.35)"
          }}>
            🩸
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 28, color: "#064e3b",
            margin: 0, letterSpacing: -0.5
          }}>
            BSUGAR
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "6px 0 0", fontWeight: 300 }}>
            {isLogin ? "Apne account mein wapas aao" : "Naya account banao"}
          </p>
        </div>

        {/* Toggle tabs */}
        <div style={{
          display: "flex", background: "#f0fdf4",
          borderRadius: 14, padding: 4, marginBottom: 24,
          border: "1px solid #d1fae5"
        }}>
          {["Login", "Register"].map((tab, i) => (
            <button key={tab} onClick={() => i === 0 ? (isLogin || switchMode()) : (isLogin && switchMode())} style={{
              flex: 1, padding: "9px 0",
              borderRadius: 11, border: "none",
              background: (i === 0 ? isLogin : !isLogin) ? "#10b981" : "transparent",
              color: (i === 0 ? isLogin : !isLogin) ? "#fff" : "#6b7280",
              fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s ease"
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Name — only register */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                NAAM
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tumhara naam"
                style={{
                  width: "100%", border: "1.5px solid #d1fae5",
                  borderRadius: 14, padding: "12px 16px",
                  fontSize: 14, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                  background: "#f8fffe", color: "#1f2937",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#d1fae5"}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tumhara@email.com"
              style={{
                width: "100%", border: "1.5px solid #d1fae5",
                borderRadius: 14, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                background: "#f8fffe", color: "#1f2937",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#d1fae5"}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%", border: "1.5px solid #d1fae5",
                borderRadius: 14, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                background: "#f8fffe", color: "#1f2937",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#d1fae5"}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 12, background: "#fef2f2",
            border: "1px solid #fecaca", borderRadius: 12,
            padding: "10px 14px", fontSize: 12,
            color: "#dc2626", fontWeight: 500
          }}>
            ❌ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", marginTop: 20,
            background: loading
              ? "#9ca3af"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff", border: "none",
            borderRadius: 14, padding: "14px",
            fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: loading ? "none" : "0 4px 16px rgba(16,185,129,0.35)",
            transition: "all 0.2s ease",
            letterSpacing: 0.3
          }}
        >
          {loading
            ? "⏳ Please wait..."
            : isLogin ? "🔐 Login Karo" : "🚀 Account Banao"
          }
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: 10, margin: "20px 0"
        }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>YA</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>

        {/* Switch mode */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", margin: 0 }}>
          {isLogin ? "Account nahi hai? " : "Pehle se account hai? "}
          <span
            onClick={switchMode}
            style={{ color: "#10b981", fontWeight: 700, cursor: "pointer" }}
          >
            {isLogin ? "Register karo" : "Login karo"}
          </span>
        </p>

      </div>
    </div>
  );
}