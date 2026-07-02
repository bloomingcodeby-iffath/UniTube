import { useNavigate } from "react-router-dom";
export default function Loginmodal({ show, onClose, dark}){
    const navigate= useNavigate();
    if(!show) return null;

    const t={
        cardBg: dark ? "#1E293B" : "#ffffff",
        text: dark ? "#F1F5F9" : "#111827",
        text: dark ? "#F1F5F9" : "#111827",
        border: dark ? "#334155" : "#DBEAFE",
        btnBg: dark ? "#2563EB" : "#1E3A5F",        
    };
   
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: t.cardBg, borderRadius: 14, padding: "28px 24px", textAlign: "center", width: 280, border: `1px solid ${t.border}`, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", fontSize: 16, cursor: "pointer", color: t.text2 }}>✕</button>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>Login required</div>
        <div style={{ fontSize: 12, color: t.text2, marginBottom: 18, lineHeight: 1.6 }}>
          Log in or create an account to continue.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={() => { onClose(); navigate("/login"); }}
            style={{ background: t.btnBg, color: "white", border: "none", padding: "8px 18px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Login
          </button>
          <button onClick={() => { onClose(); navigate("/register"); }}
            style={{ background: "transparent", color: t.text, border: `1px solid ${t.border}`, padding: "8px 18px", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
}