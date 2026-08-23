import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

function useVisible() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function fadeUp(visible, delay = 0) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.6s ease ${delay}s`,
  };
}

export default function Footer({ t }) {
  const navigate = useNavigate();
  const [footerRef, footerVisible] = useVisible();

  return (
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
            { title: "Platform", links: [
              { label: "Browse courses", to: "/courses" },
              { label: "Departments", to: "/courses" },
              { label: "My dashboard", to: "/dashboard" },
            ] },
            { title: "Account", links: [
              { label: "Sign in", to: "/login" },
              { label: "Register", to: "/register" },
            ] },
            { title: "University", links: [
              { label: "Contact", to: "/about" },
            ] },
          ].map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{col.title}</h4>
              {col.links.map((l) => (
                <a key={l.label} href="#" onClick={(e) => { e.preventDefault(); navigate(l.to); }}
                  style={{ display: "block", fontSize: 12, color: "#93C5FD", opacity: 0.5, textDecoration: "none", marginBottom: 6, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(96,165,250,0.1)", paddingTop: 20, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.35 }}>© 2026 UniTube • University Lectures</div>
          <div style={{ fontSize: 11, color: "#93C5FD", opacity: 0.35 }}>Made by Iffath & Fariba</div>
        </div>
      </div>-
    </footer>
  );
}