import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ dark, setDark, showAuthButtons = true, showLogout = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const s = {
    nav: {
      background: dark ? "#0A0F1E" : "#1E3A5F",
      padding: "0 40px", height: 64,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(96,165,250,0.1)",
      boxShadow: "0 2px 20px rgba(0,0,0,0.2)"
    },
    brand: { fontSize: 20, fontWeight: 800, color: "#60A5FA", cursor: "pointer", letterSpacing: "-0.02em" },
    midLink: (active) => ({
      color: active ? "#60A5FA" : "rgba(255,255,255,0.65)",
      fontSize: 14, textDecoration: "none", fontWeight: active ? 600 : 400,
      cursor: "pointer", padding: "4px 0",
      borderBottom: active ? "2px solid #60A5FA" : "2px solid transparent",
      transition: "all 0.2s"
    }),
    toggle: {
      background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)",
      borderRadius: 20, padding: "6px 14px", cursor: "pointer",
      fontSize: 13, color: "#93C5FD", display: "flex", alignItems: "center", gap: 6
    },
    btnOutline: {
      background: "transparent", border: "1px solid #60A5FA",
      color: "#60A5FA", padding: "7px 18px", borderRadius: 7,
      fontSize: 13, cursor: "pointer", fontWeight: 500, transition: "all 0.2s"
    },
    btnFill: {
      background: "#2563EB", color: "white", border: "none",
      padding: "7px 18px", borderRadius: 7,
      fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
    },
  };

  return (
    <nav style={s.nav}>
      {/* Brand */}
      <div style={s.brand} onClick={() => navigate("/")}>🎬 UniTube</div>

      {/* Middle Links */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        <span style={s.midLink(location.pathname === "/")} onClick={() => navigate("/")}>Home</span>
        <span style={s.midLink(location.pathname === "/about")} onClick={() => navigate("/about")}>About</span>
        {token && (
          <>
            <span style={s.midLink(location.pathname === "/courses")} onClick={() => navigate("/courses")}>Courses</span>
            <span style={s.midLink(location.pathname === "/dashboard")} onClick={() => navigate("/dashboard")}>Dashboard</span>
          </>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button style={s.toggle} onClick={() => setDark(!dark)}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
        {token ? (
          <button style={s.btnOutline} onClick={logout}>Logout</button>
        ) : (
          <>
            <button style={s.btnOutline} onClick={() => navigate("/login")}>Sign in</button>
            <button style={s.btnFill} onClick={() => navigate("/register")}>Get started</button>
          </>
        )}
      </div>
    </nav>
  );
}