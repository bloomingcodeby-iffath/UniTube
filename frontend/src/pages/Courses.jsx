import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllCourses, selectCourse, getPlaylist, getCourseThumbnail } from "../api/api";
import Footer from "../components/Footer";

export default function Courses({ dark, setDark }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filterDept, setFilterDept] = useState(searchParams.get("dept") || "All");
  const [loading, setLoading] = useState(true);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");
  const [thumbnails, setThumbnails] = useState({});
  const token = localStorage.getItem("token");

  async function openPlaylist(course) {
    setViewingCourse(course);
    setLoadingPlaylist(true);
    try {
      const res = await getPlaylist(token, course.id);
      setPlaylistItems(res.playlists || []);
    } catch {
      setPlaylistItems([]);
    }
    setLoadingPlaylist(false);
  }

  function closePlaylist() {
    setViewingCourse(null);
    setPlaylistItems([]);
  }

  async function handleAddCourse(e, course) {
    e.stopPropagation();
    await selectCourse(token, course.id);
    setAddedMsg(`"${course.title}" added to your courses!`);
    setTimeout(() => setAddedMsg(""), 2000);
  }

  // Converts a normal YouTube watch/playlist URL into an embeddable URL.
  // Check for a playlist (list=) FIRST — a playlist link often also has
  // a v= param for the first video, and we still want the full sidebar.
  function toEmbedUrl(url) {
    if (!url) return "";
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return url;
  }

  const depts = ["All", "CSE", "DS", "SWE", "EEE"];

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllCourses(token);
        const list = res.courses || [];
        setCourses(list);

        // fetch real YouTube thumbnails in the background - cards fall
        // back to the colored placeholder until each one resolves
        list.forEach(async (c) => {
          const url = await getCourseThumbnail(token, c.id);
          if (url) {
            setThumbnails((prev) => ({ ...prev, [c.id]: url }));
          }
        });
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
                onClick={() => openPlaylist(course)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = dark ? "0 12px 32px rgba(0,0,0,0.4)" : "0 12px 32px rgba(37,99,235,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.25s", cursor: "pointer" }}>
                <div style={{
                  height: 130, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  background: thumbnails[course.id]
                    ? `#000 url(${thumbnails[course.id]}) center/cover no-repeat`
                    : cardColors[i % cardColors.length]
                }}>
                  {thumbnails[course.id] && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
                  )}
                  <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1, background: "#60A5FA", color: "#0F172A", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>{course.department}</div>
                  <div style={{ zIndex: 1, width: 44, height: 44, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>▶</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4, lineHeight: 1.4 }}>{course.title}</div>
                  <div style={{ fontSize: 11, color: t.text2, marginBottom: 12, opacity: 0.8 }}>{course.instructor}</div>
                  <button onClick={(e) => handleAddCourse(e, course)} style={{ width: "100%", background: t.btnBg, color: "white", border: "none", padding: "8px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Add to My Courses →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Added to My Courses toast */}
      {addedMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#16A34A", color: "white", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 200 }}>
          ✅ {addedMsg}
        </div>
      )}

      {/* Playlist Modal */}
      {viewingCourse && (
        <div onClick={closePlaylist} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.cardBg, borderRadius: 16, maxWidth: 860, width: "100%", maxHeight: "85vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{viewingCourse.title}</div>
                <div style={{ fontSize: 12, color: t.text2, opacity: 0.8 }}>{viewingCourse.department}</div>
              </div>
              <button onClick={closePlaylist} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: t.text }}>✕</button>
            </div>

            {loadingPlaylist ? (
              <div style={{ textAlign: "center", padding: 32, color: t.text2 }}>Loading videos...</div>
            ) : playlistItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: t.text2 }}>
                No videos added for this course yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {playlistItems.map(p => (
                  <div key={p.playlist_id} style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                      <iframe
                        src={toEmbedUrl(p.yt_url)}
                        title={p.playlist_title}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        allowFullScreen
                      />
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{p.playlist_title}</div>
                      <div style={{ fontSize: 11, color: t.text2, opacity: 0.8, marginBottom: 8 }}>{p.channel_name} · {p.language}</div>
                      <a href={p.yt_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: t.accent, fontWeight: 600, textDecoration: "none" }}>
                        ▶ Open full playlist on YouTube →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <Footer t={t} />
    </div>
  );
}