import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoginModal from "../components/LoginModal";
import heroLight from "../assets/hero-light.png";
import heroDark from "../assets/hero-dark.png";

const departments = [
  { icon: "💻", name: "Computer Science & Engineering (CSE)", count: "40+ courses" },
  { icon: "📊", name: "Data Science (DS)", count: "25+ courses" },
  { icon: "💻", name: "Software Engineering (SWE)", count: "40+ courses" },
  { icon: "⚡", name: "Electrical & Electronics Engineering (EEE)", count: "20+ courses" },
  { icon: "🎓", name: "All Depts.", count: "100+ courses" },
];

const videos = [
  { title: "Algorithm Design and Analysis", channel: "Abdul Bari • English", badge: "CSE", bg: "linear-gradient(135deg,#1E3A5F,#2563EB)" },
  { title: "Artificial Intelligence", channel: "MIT OpenCourse • English", badge: "CSE", bg: "linear-gradient(135deg,#2563EB,#60A5FA)" },
  { title: "Data Structures", channel: "Jenny's Lectures • English", badge: "CSE", bg: "linear-gradient(135deg,#1E40AF,#2563EB)" },
];

const stats = [
  { num: "3+", label: "Departments" },
  { num: "100+", label: "Courses" },
  { num: "500+", label: "Video lectures" },
  { num: "24/7", label: "Access anytime" },
];

// Animation hook
function useVisible() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function Home({ dark, setDark }) {
  const [showModal, setShowModal] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsRef, statsVisible] = useVisible();
  const [deptRef, deptVisible] = useVisible();
  const [videoRef, videoVisible] = useVisible();
  const [footerRef, footerVisible] = useVisible();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  const t = {
    bg: dark ? "#0F172A" : "#F9FAFB",
    bg2: dark ? "#1E293B" : "#EFF6FF",
    text: dark ? "#F1F5F9" : "#111827",
    text2: dark ? "#60A5FA" : "#2563EB",
    cardBg: dark ? "#1E293B" : "#ffffff",
    border: dark ? "#334155" : "#DBEAFE",
    navBg: dark ? "#0A0F1E" : "#1E3A5F",
    searchBg: dark ? "#1E293B" : "#ffffff",
    tagBg: dark ? "#1E293B" : "#EFF6FF",
    btnBg: dark ? "#2563EB" : "#1E3A5F",
    accent: dark ? "#60A5FA" : "#2563EB",
  };

  const fadeUp = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, color: t.text, minHeight: "100vh" }}>

      {/* Global CSS for keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <Navbar dark={dark} setDark={setDark} />

      {/* HERO */}
      <div style={{ background: t.bg, position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400, borderRadius: "50%",
          background: dark ? "rgba(37,99,235,0.08)" : "rgba(37,99,235,0.06)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -50, left: -50,
          width: 250, height: 250, borderRadius: "50%",
          background: dark ? "rgba(96,165,250,0.06)" : "rgba(30,58,95,0.04)",
          pointerEvents: "none"
        }} />

        <div style={{
          padding: "70px 40px 60px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 40,
          maxWidth: 1100, margin: "0 auto", position: "relative"
        }}>
          {/* Left */}
          <div style={{ flex: 1.2, ...fadeUp(heroVisible, 0) }}>
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700,
              color: t.accent, textTransform: "uppercase",
              letterSpacing: "0.12em", marginBottom: 16,
              background: dark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)",
              padding: "5px 14px", borderRadius: 20,
              border: `1px solid ${dark ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.15)"}`,
            }}>
              🎓 University Course Platform
            </div>

             <h1 style={{ fontSize: 44, fontWeight: 800, color: t.text, lineHeight: 1.15, marginBottom: 14 }}>
              University Course<br />
              <span style={{ color: dark ? "#8995d7" : "#3555d5bf", fontStyle: "italic" }}>Video</span> Library
            </h1>

            <p style={{ fontSize: 15, color: t.text2, marginBottom: 28, lineHeight: 1.75, opacity: 0.85 }}>
              Your courses, anytime anywhere.<br />
              One platform for lectures from all departments.
            </p>

            {/* Search */}
            <div style={{
              display: "flex", background: t.searchBg,
              border: `1.5px solid ${t.border}`, borderRadius: 12,
              overflow: "hidden", maxWidth: 460,
              boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(37,99,235,0.1)"
            }}>
              <input type="text" placeholder="Search any subject or course..."
                onKeyDown={(e) => e.key === "Enter" && setShowModal(true)}
                style={{
                  flex: 1, padding: "13px 16px", border: "none",
                  outline: "none", fontSize: 13, color: t.text,
                  background: "transparent"
                }} />
              <button onClick={() => setShowModal(true)} style={{
                background: t.btnBg, color: "white", border: "none",
                padding: "13px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "background 0.2s"
              }}>
                Search
              </button>
            </div>

            {/* Tags */}
            <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: t.text2, opacity: 0.7 }}>Popular:</span>
              {["Algorithm", "AI", "Data Structures", "Database"].map((tag) => (
                <span key={tag} onClick={() => setShowModal(true)} style={{
                  fontSize: 11, color: t.accent, background: t.tagBg,
                  border: `1px solid ${t.border}`, borderRadius: 20,
                  padding: "4px 12px", cursor: "pointer", transition: "all 0.2s",
                  fontWeight: 500
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.tagBg; e.currentTarget.style.color = t.accent; }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
              <button onClick={() => navigate("/register")} style={{
                background: t.btnBg, color: "white", border: "none",
                padding: "12px 24px", borderRadius: 8, fontSize: 14,
                fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)"
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                Get Started →
              </button>
              <button onClick={() => setShowModal(true)} style={{
                background: "transparent", color: t.accent,
                border: `1.5px solid ${t.accent}`, padding: "12px 24px",
                borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.accent; }}>
                Sign In
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", ...fadeUp(heroVisible, 0.2) }}>
            <div >
              <img src={dark ? heroDark : heroLight} alt="UniTube Hero"
                style={{
                  width: "100%", maxWidth: 500, height: "auto",
                  objectFit: "contain", transition: "0.4s ease",
                  filter: dark
                    ? "drop-shadow(0 0 30px rgba(96,165,250,0.3))"
                    : "drop-shadow(0 20px 40px rgba(37,99,235,0.15))",
                }} />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div ref={statsRef} style={{
        background: t.navBg, padding: "28px 40px",
        display: "flex", justifyContent: "center", gap: 64,
        borderTop: "1px solid rgba(96,165,250,0.1)",
        ...fadeUp(statsVisible, 0)
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ textAlign: "center", ...fadeUp(statsVisible, i * 0.1) }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#60A5FA" }}>{s.num}</div>
            <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.7, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* DEPARTMENTS */}
      <div ref={deptRef} style={{ padding: "56px 40px", background: t.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Browse by department</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 28, ...fadeUp(deptVisible, 0) }}>
            Which department are you in?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {departments.map((d, i) => (
              <div key={d.name} onClick={() => setShowModal(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = dark ? "0 8px 24px rgba(37,99,235,0.2)" : "0 8px 24px rgba(37,99,235,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: "20px 12px", textAlign: "center",
                  cursor: "pointer", transition: "all 0.25s",
                  ...fadeUp(deptVisible, i * 0.08)
                }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text, lineHeight: 1.4 }}>{d.name}</div>
                <div style={{ fontSize: 10, color: t.text2, marginTop: 4, opacity: 0.8 }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIDEOS */}
      <div ref={videoRef} style={{ background: t.bg2, padding: "56px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Trending now</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 28, ...fadeUp(videoVisible, 0) }}>
            Popular video lectures
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {videos.map((v, i) => (
              <div key={v.title} onClick={() => setShowModal(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = dark ? "0 12px 32px rgba(0,0,0,0.4)" : "0 12px 32px rgba(37,99,235,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  background: t.cardBg, border: `1px solid ${t.border}`,
                  borderRadius: 14, overflow: "hidden", cursor: "pointer",
                  transition: "all 0.25s", ...fadeUp(videoVisible, i * 0.1)
                }}>
                <div style={{ height: 140, background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: "#60A5FA", color: "#0F172A",
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5
                  }}>{v.badge}</div>
                  <div style={{
                    width: 44, height: 44, background: "white", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s"
                  }}>▶</div>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4, lineHeight: 1.4 }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: t.text2, opacity: 0.8 }}>{v.channel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer ref={footerRef} style={{ background: t.navBg, padding: "40px 40px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, ...fadeUp(footerVisible, 0) }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#60A5FA", marginBottom: 8 }}>🎬 UniTube</div>
              <div style={{ fontSize: 12, color: "#93C5FD", opacity: 0.6, maxWidth: 220, lineHeight: 1.7 }}>
                University Course video library
              </div>
            </div>
            {[
              { title: "Platform", links: ["Browse courses", "Departments", "My dashboard"] },
              { title: "Account", links: ["Sign in", "Register"] },
              { title: "University", links: ["Metropolitan University", "CSE Department", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{col.title}</h4>
                {col.links.map((l) => (
                  <a key={l} href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                    style={{ display: "block", fontSize: 12, color: "#93C5FD", opacity: 0.5, textDecoration: "none", marginBottom: 6, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(96,165,250,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.35 }}>© 2026 UniTube • Metropolitan University, Sylhet</div>
            <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.35 }}>Made by Iffath & Fariba</div>
          </div>
        </div>
      </footer>

      <LoginModal show={showModal} onClose={() => setShowModal(false)} dark={dark} />
    </div>
  );
}