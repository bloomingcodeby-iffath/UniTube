import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { updateProfile } from "../api/api";
import useIsMobile from "../hooks/useIsMobile";

export default function Profile({ dark, setDark }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    username: storedUser.name || "",
    institution: storedUser.university || "",
    department: storedUser.department || "",
    batch: storedUser.batch || "",
    year_semester: storedUser.year_semester || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(token, form);
      setMessage("Profile updated successfully!");

      // keep localStorage "user" in sync so Navbar/Dashboard show fresh name
      const updatedUser = { ...storedUser, name: form.username, department: form.department };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
    setSaving(false);
  }

  const t = dark
    ? { bg: "#0F172A", cardBg: "#1E293B", text: "white", text2: "#94A3B8", border: "#334155", accent: "#60A5FA", btnBg: "#2563EB" }
    : { bg: "#F8FAFC", cardBg: "white", text: "#0F172A", text2: "#475569", border: "#E2E8F0", accent: "#2563EB", btnBg: "#2563EB" };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 13,
    border: `1.5px solid ${t.border}`, outline: "none", color: t.text,
    background: t.bg, boxSizing: "border-box", marginBottom: 14,
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg }}>
      <Navbar dark={dark} setDark={setDark} />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px" }}>
        <h2 style={{ color: t.text, marginBottom: 24 }}>Edit Profile</h2>

        <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
          <label style={{ fontSize: 12, color: t.text2 }}>Username</label>
          <input style={inputStyle} name="username" value={form.username} onChange={handleChange} />

          
          <label style={{ fontSize: 12, color: t.text2 }}>Institution</label>
          <input style={inputStyle} name="institution" value={form.institution} onChange={handleChange} />

          <label style={{ fontSize: 12, color: t.text2 }}>Department</label>
          <input style={inputStyle} name="department" value={form.department} onChange={handleChange} />

    
          <label style={{ fontSize: 12, color: t.text2 }}>Year - Semester</label>
          <input style={inputStyle} name="year_semester" value={form.year_semester} onChange={handleChange} />

          {message && <div style={{ color: "#22C55E", fontSize: 13, marginBottom: 10 }}>{message}</div>}
          {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 10 }}>{error}</div>}

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: t.btnBg, color: "white", fontWeight: 600, fontSize: 14,
            cursor: "pointer", opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}