import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllCourses } from "../api/api";

export default function Courses({ dark, setDark }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const depts = ["All", "CSE", "DS", "SWE", "EEE"];

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllCourses(token);
        setCourses(res.courses || []);
      } catch {
        console.error("Failed to load courses");
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "All" || c.department === filterDept;
    return matchSearch && matchDept;
  });

  const cardColors = [
    "linear-gradient(135deg,#1E3A5F,#2563EB)",
    "linear-gradient(135deg,#2563EB,#60A5FA)",
    "linear-gradient(135deg,#1E40AF,#2563EB)",
    "linear-gradient(135deg,#0F172A,#1E3A5F)",
  ];

  const t = {
    bg: dark ? "#0F172A" : "#F9FAFB",
    bg2: dark ? "#1E293B" : "#EFF6FF",
    text: dark ? "#F1F5F9" : "#111827",
    text2: dark ? "#60A5FA" : "#2563EB",
    cardBg: dark ? "#1E293B" : "#ffffff",
    border: dark ? "#334155" : "#DBEAFE",
    navBg: dark ? "#0A0F1E" : "#1E3A5F",
    inputBg: dark ? "#0F172A" : "#F8FAFF",
    btnBg: dark ? "#2563EB" : "#1E3A5F",
    accent: dark ? "#60A5FA" : "#2563EB",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", color: t.text }}>
      <Navbar dark={dark} setDark={setDark} />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${dark ? "#0A0F1E" : "#1E3A5F"}, #2563EB)`, padding: "48px 40px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#93C5FD", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>All Courses</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 8 }}>Course Library</h1>
          <p style={{ fontSize: 14, color: "#93C5FD", marginBottom: 28 }}>Browse all available video lectures</p>

          {/* Search */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 10, overflow: "hidden", maxWidth: 480, backdropFilter: "blur(10px)" }}>
            <input type="text" placeholder="Search courses or instructors..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: "12px 16px", border: "none", outline: "none", fontSize: 13, color: "white", background: "transparent" }} />
            <span style={{ padding: "12px 16px", color: "rgba(255,255,255,0.6)", fontSize: 16 }}>🔍</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>

        {/* Department Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {depts.map(d => (
            <button key={d} onClick={() => setFilterDept(d)} style={{
              padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
              background: filterDept === d ? t.accent : t.cardBg,
              color: filterDept === d ? "white" : t.text2,
              border: filterDept === d ? "none" : `1px solid ${t.border}`,
              transition: "all 0.2s"
            }}>
              {d}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 13, color: t.text2, marginBottom: 20, opacity: 0.7 }}>
          {loading ? "Loading..." : `${filtered.length} courses found`}
        </div>

        {/* Course Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: t.text2 }}>Loading courses...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: t.text2 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>No courses found</div>
            <div style={{ fontSize: 13 }}>Try a different search or filter</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {filtered.map((course, i) => (
              <div key={course.id}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = dark ? "0 12px 32px rgba(0,0,0,0.4)" : "0 12px 32px rgba(37,99,235,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.25s", cursor: "pointer" }}>
                <div style={{ height: 130, background: cardColors[i % cardColors.length], display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ position: "absolute", top: 10, left: 10, background: "#60A5FA", color: "#0F172A", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{course.department}</div>
                  <div style={{ width: 44, height: 44, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>▶</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4, lineHeight: 1.4 }}>{course.title}</div>
                  <div style={{ fontSize: 11, color: t.text2, marginBottom: 12, opacity: 0.8 }}>{course.instructor}</div>
                  <button onClick={() => navigate("/dashboard")} style={{ width: "100%", background: t.btnBg, color: "white", border: "none", padding: "8px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Add to My Courses →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}