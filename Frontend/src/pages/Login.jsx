import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState(null);
  const [submitHover, setSubmitHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setShow(true), 50);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (isLogin) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#0a0f0d",
      color: "#e8fdf4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background neon blobs */}
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -120, left: -100,
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Glassmorphic Card */}
      <div style={{
        background: "rgba(17, 24, 20, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        padding: "40px 36px",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.05)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Logo Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60,
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 18, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 4px 20px rgba(16,185,129,0.5)",
            filter: "drop-shadow(0 0 8px rgba(16,185,129,0.35))"
          }}>
            🩸
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 32, color: "#e8fdf4",
            margin: 0, letterSpacing: -0.5,
            textShadow: "0 0 10px rgba(232,253,244,0.15)"
          }}>
            BSUGAR
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "8px 0 0", fontWeight: 400 }}>
            {isLogin ? "Apne account mein wapas aao" : "Naya account banao"}
          </p>
        </div>

        {/* Toggle tabs */}
        <div style={{
          display: "flex", background: "#0d1611",
          borderRadius: 14, padding: 4, marginBottom: 26,
          border: "1px solid #1a2e23"
        }}>
          {["Login", "Register"].map((tab, i) => {
            const isTabActive = i === 0 ? isLogin : !isLogin;
            return (
              <button
                key={tab}
                onClick={() => i === 0 ? (isLogin || switchMode()) : (isLogin && switchMode())}
                style={{
                  flex: 1, padding: "10px 0",
                  borderRadius: 11, border: "none",
                  background: isTabActive ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                  color: isTabActive ? "#fff" : "#6b7280",
                  fontWeight: 600, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.25s ease",
                  boxShadow: isTabActive ? "0 2px 10px rgba(16,185,129,0.3)" : "none"
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name Field (Register only) */}
          {!isLogin && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, display: "block", marginBottom: 6 }}>
                NAAM
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="Tumhara naam"
                style={{
                  width: "100%",
                  border: focusedField === "name" ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
                  borderRadius: 14, padding: "12px 16px",
                  fontSize: 14, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                  background: "#0d1611", color: "#e8fdf4",
                  boxShadow: focusedField === "name" ? "0 0 15px rgba(16,185,129,0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              placeholder="tumhara@email.com"
              style={{
                width: "100%",
                border: focusedField === "email" ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
                borderRadius: 14, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                background: "#0d1611", color: "#e8fdf4",
                boxShadow: focusedField === "email" ? "0 0 15px rgba(16,185,129,0.15)" : "none",
                transition: "all 0.2s ease"
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%",
                border: focusedField === "password" ? "1.5px solid #10b981" : "1.5px solid #1a2e23",
                borderRadius: 14, padding: "12px 16px",
                fontSize: 14, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box",
                background: "#0d1611", color: "#e8fdf4",
                boxShadow: focusedField === "password" ? "0 0 15px rgba(16,185,129,0.15)" : "none",
                transition: "all 0.2s ease"
              }}
            />
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div style={{
            marginTop: 16, background: "#1a0000",
            border: "1px solid #ef4444", borderRadius: 14,
            padding: "12px 16px", fontSize: 13,
            color: "#f87171", fontWeight: 500,
            boxShadow: "0 4px 20px rgba(239,68,68,0.2)",
            animation: "fadeSlideUp 0.3s ease-out"
          }}>
            ❌ {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          onMouseEnter={() => setSubmitHover(true)}
          onMouseLeave={() => setSubmitHover(false)}
          style={{
            width: "100%", marginTop: 24,
            background: loading
              ? "#1a2e23"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: loading ? "#6b7280" : "#fff",
            border: "none",
            borderRadius: 14, padding: "14px",
            fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            boxShadow: loading ? "none" : (submitHover ? "0 4px 24px rgba(16,185,129,0.5)" : "0 4px 18px rgba(16,185,129,0.35)"),
            transform: submitHover && !loading ? "scale(1.02)" : "scale(1)",
            transition: "all 0.25s ease",
            letterSpacing: 0.5
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
          gap: 12, margin: "24px 0"
        }}>
          <div style={{ flex: 1, height: 1, background: "#1a2e23" }} />
          <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 0.5 }}>YA</span>
          <div style={{ flex: 1, height: 1, background: "#1a2e23" }} />
        </div>

        {/* Switch Mode Tab Footer */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", margin: 0 }}>
          {isLogin ? "Account nahi hai? " : "Pehle se account hai? "}
          <span
            onClick={switchMode}
            onMouseEnter={() => setRegisterHover(true)}
            onMouseLeave={() => setRegisterHover(false)}
            style={{
              color: "#10b981",
              fontWeight: 700,
              cursor: "pointer",
              textShadow: registerHover ? "0 0 8px rgba(16,185,129,0.4)" : "none",
              transition: "text-shadow 0.2s"
            }}
          >
            {isLogin ? "Register karo" : "Login karo"}
          </span>
        </p>

      </div>
    </div>
  );
}