import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function About({ dark, setDark }) {
  const navigate = useNavigate();
useEffect(() => {
  AOS.init({
    duration: 700,
    once: true,
  });
}, []);
  const t = {
    bg: dark ? "#0F172A" : "#F9FAFB",
    text: dark ? "#F1F5F9" : "#111827",
    text2: dark ? "#60A5FA" : "#2563EB",
    cardBg: dark ? "#1E293B" : "#ffffff",
    border: dark ? "#334155" : "#DBEAFE",
    navBg: dark ? "#0A0F1E" : "#1E3A5F",
    accent: dark ? "#60A5FA" : "#2563EB",
    btnBg: dark ? "#2563EB" : "#1E3A5F",
  };

  const features = [
    { icon: "🎬", title: "Video Lectures", desc: "Access 500+ recorded lectures from all departments anytime, anywhere." },
    { icon: "📚", title: "Course Library", desc: "Organized by department and subject for easy navigation." },
    { icon: "📝", title: "Smart Notes", desc: "Take notes, highlight key points and track your checklist per course." },
    { icon: "🔍", title: "Search & Filter", desc: "Find any lecture by subject, department, or instructor instantly." },
    { icon: "📊", title: "Progress Tracking", desc: "Track your learning progress across all enrolled courses." },
    { icon: "24/7", title: "Always Available", desc: "Study at your own pace, on your own schedule." },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, color: t.text, minHeight: "100vh" }}>
      <Navbar dark={dark} setDark={setDark} />

      {/* Hero */}
      <div data-aos="fade-up" style={{ background: `linear-gradient(135deg, ${dark ? "#011c6d" : "#414551"}, ${dark ? "#1E293B" : "#2563EB"})`, padding: "80px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-0.02em" }}>
            About UniTube
          </h1>
          <p style={{ fontSize: 16, color: "#93C5FD", lineHeight: 1.8, marginBottom: 32 }}>
            UniTube is a course video platform for University Students.
            Built by students, for students — to make quality education accessible anytime, anywhere.
          </p>
          <button onClick={() => navigate("/register")} style={{
            background: "white", color: "#1E3A5F", border: "none",
            padding: "13px 28px", borderRadius: 8, fontSize: 15,
            fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
          }}>
            Get Started →
          </button>
        </div>
      </div>

      {/* Mission */}
      <div data-aos="fade-up" style={{ padding: "64px 40px", background: t.bg }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Our Mission</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: t.text, marginBottom: 20 }}>
            Making university education more accessible
          </h2>
          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.8, opacity: 0.85 }}>
            We believe every student deserves access to quality learning materials.
            UniTube brings all department lectures together in one place —
            so you never miss a class, and can always review at your own pace.
          </p>
        </div>
      </div>

      {/* Features */}
      <div data-aos="fade-up" style={{ padding: "0 40px 64px", background: t.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Features</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: t.text }}>Everything you need to learn</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} style={{
                background: t.cardBg, border: `1px solid ${t.border}`,
                borderRadius: 14, padding: "28px 24px",
                transition: "all 0.25s"
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = t.accent; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: t.text2, lineHeight: 1.7, opacity: 0.85 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div data-aos="fade-up"  style={{ padding: "48px 40px", background: dark ? "#1E293B" : "#EFF6FF" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>The Team</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 20 }}>Made by</h2>
          <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            {["Iffath", "Fariba"].map((name) => (
              <div key={name} style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 32px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", margin: "0 auto 10px" }}>
                  {name[0]}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{name}</div>
                <div style={{ fontSize: 12, color: t.text2, marginTop: 2 }}>CSE, Metropolitan University</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: t.navBg, padding: "24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.4 }}>© 2026 UniTube • Metropolitan University, Sylhet</div>
      </footer>
    </div>
  );
}