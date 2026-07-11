import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../api/api";

export default function Login({ dark, setDark }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = {
    bg: dark ? "#0F172A" : "#F9FAFB",
    text: dark ? "#F1F5F9" : "#111827",
    text2: dark ? "#60A5FA" : "#2563EB",
    cardBg: dark ? "#1E293B" : "#ffffff",
    border: dark ? "#334155" : "#DBEAFE",
    inputBg: dark ? "#0F172A" : "#F8FAFF",
    btnBg: dark ? "#2563EB" : "#1E3A5F",
    accent: dark ? "#60A5FA" : "#2563EB",
  };

  const inputStyle = {
    width: "100%", background: t.inputBg,
    border: `1.5px solid ${t.border}`, borderRadius: 8,
    padding: "11px 14px", fontSize: 13, color: t.text,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: t.text2,
    marginBottom: 6, display: "block",
    textTransform: "uppercase", letterSpacing: "0.05em"
  };

  async function doLogin() {
    if (!email || !pass) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await loginUser(email, pass);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/dashboard");
      } else {
        setError(res.message || "Login failed. Check your credentials.");
      }
    } catch {
      setError("Server error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh" }}>
      <Navbar dark={dark} setDark={setDark} />
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Card */}
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: "40px 36px", boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(37,99,235,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>Welcome back</div>
              <div style={{ fontSize: 13, color: t.text2, opacity: 0.8 }}>Sign in to access your courses</div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="your@university.edu" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border}
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="••••••••" value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doLogin()}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border}
                style={inputStyle} />
            </div>

            <button onClick={doLogin} disabled={loading}
              style={{ width: "100%", background: t.btnBg, color: "white", border: "none", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: t.text2 }}>
              Don't have an account?{" "}
              <span onClick={() => navigate("/register")} style={{ color: t.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                Register now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}