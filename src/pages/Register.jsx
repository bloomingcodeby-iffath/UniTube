import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../api/api";

export default function Register({ dark, setDark }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", university: "Metropolitan University", department: "", year: "", semester: "", password: "" });
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

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  async function doRegister() {
    if (!form.name || !form.email || !form.password || !form.department) {
      setError("Please fill all required fields"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await registerUser(form);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/dashboard");
      } else {
        setError(res.message || "Registration failed.");
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
        <div style={{ width: "100%", maxWidth: 500 }}>
          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: "40px 36px", boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(37,99,235,0.08)" }}>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>Create your account</div>
              <div style={{ fontSize: 13, color: t.text2, opacity: 0.8 }}>Join UniTube and access all course videos</div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.border}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" placeholder="your@university.edu" value={form.email} onChange={e => set("email", e.target.value)}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.border}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>University</label>
                <input placeholder="Metropolitan University" value={form.university} onChange={e => set("university", e.target.value)}
                  onFocus={e => e.target.style.borderColor = t.accent}
                  onBlur={e => e.target.style.borderColor = t.border}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Department *</label>
                <select value={form.department} onChange={e => set("department", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select dept.</option>
                  {["CSE", "DS", "SWE", "EEE"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <select value={form.year} onChange={e => set("year", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Semester</label>
                <select value={form.semester} onChange={e => set("semester", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select semester</option>
                  {["1st Semester", "2nd Semester"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Password *</label>
              <input type="password" placeholder="Create a strong password" value={form.password}
                onChange={e => set("password", e.target.value)}
                onFocus={e => e.target.style.borderColor = t.accent}
                onBlur={e => e.target.style.borderColor = t.border}
                style={inputStyle} />
            </div>

            <button onClick={doRegister} disabled={loading}
              style={{ width: "100%", background: t.btnBg, color: "white", border: "none", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 20, transition: "all 0.2s", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
              {loading ? "Creating account..." : "Create account →"}
            </button>

            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: t.text2 }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={{ color: t.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                Sign in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}