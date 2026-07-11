import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserCourses, getAllCourses, selectCourse, removeCourse, getNotes, saveNote, getPlaylist, getCourseThumbnail } from "../api/api";

export default function Dashboard({ dark, setDark }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("courses"); // courses | notes
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [notes, setNotes] = useState({ text: "", highlights: [], checklist: [] });
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("my"); // my | browse
  const [viewingCourse, setViewingCourse] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u || !token) { navigate("/login"); return; }
    setUser(JSON.parse(u));
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const [all, my] = await Promise.all([getAllCourses(token), getUserCourses(token)]);
      setAllCourses(all.courses || []);
      setMyCourses(my.courses || []);

      // fetch real YouTube thumbnails in the background - cards fall back
      // to the colored placeholder until each one resolves
      const seen = new Set();
      [...(all.courses || []), ...(my.courses || [])].forEach(async (c) => {
        if (seen.has(c.id)) return;
        seen.add(c.id);
        const url = await getCourseThumbnail(token, c.id);
        if (url) {
          setThumbnails((prev) => ({ ...prev, [c.id]: url }));
        }
      });
    } catch {
      console.error("Failed to load courses");
    }
  }

  async function toggleCourse(course) {
    const isEnrolled = myCourses.find(c => c.id === course.id);

    if (isEnrolled) {
      setMyCourses(myCourses.filter(c => c.id !== course.id));
      await removeCourse(token, course.id);
    } else {
      setMyCourses([...myCourses, course]);
      await selectCourse(token, course.id);
    }
  }

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

  function toEmbedUrl(url) {
    if (!url) return "";
    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return url;
  }

  async function openNotes(course) {
    setSelectedCourse(course);
    setActiveTab("notes");
    try {
      const res = await getNotes(token, course.id);
      setNotes(res.notes || { text: "", highlights: [], checklist: [] });
    } catch {
      setNotes({ text: "", highlights: [], checklist: [] });
    }
  }

  async function handleSaveNote() {
    if (!selectedCourse) return;
    setSaving(true);
    await saveNote(token, selectedCourse.id, notes);
    setSaving(false);
  }

  function addCheckItem() {
    if (!newCheckItem.trim()) return;
    setNotes(prev => ({ ...prev, checklist: [...prev.checklist, { text: newCheckItem, done: false }] }));
    setNewCheckItem("");
  }

  function toggleCheck(i) {
    const updated = [...notes.checklist];
    updated[i].done = !updated[i].done;
    setNotes(prev => ({ ...prev, checklist: updated }));
  }

  function removeCheck(i) {
    setNotes(prev => ({ ...prev, checklist: prev.checklist.filter((_, idx) => idx !== i) }));
  }

  function addHighlight() {
    if (!newHighlight.trim()) return;
    setNotes(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
    setNewHighlight("");
  }

  function removeHighlight(i) {
    setNotes(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }));
  }

  const filtered = (tab === "my" ? myCourses : allCourses).filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.department?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = user?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

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

  const cardColors = [
    "linear-gradient(135deg,#1E3A5F,#2563EB)",
    "linear-gradient(135deg,#2563EB,#60A5FA)",
    "linear-gradient(135deg,#1E40AF,#2563EB)",
    "linear-gradient(135deg,#0F172A,#1E3A5F)",
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", color: t.text }}>
      <Navbar dark={dark} setDark={setDark} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>

        {/* Welcome */}
        <div style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)", borderRadius: 16, padding: "28px 32px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>Welcome back, {user?.name}! 👋</h2>
            <p style={{ fontSize: 13, color: "#93C5FD" }}>{user?.department} • {user?.university}</p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>
            {initials}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["courses", "📚 My Courses"], ["notes", "📝 Notes"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
              background: activeTab === key ? t.btnBg : t.cardBg,
              color: activeTab === key ? "white" : t.text2,
              border: activeTab === key ? "none" : `1px solid ${t.border}`,
              transition: "all 0.2s"
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <div>
            {/* Sub tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: `1px solid ${t.border}`, paddingBottom: 12 }}>
              {[["my", "My Courses"], ["browse", "Browse All"]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  background: tab === key ? t.accent : "transparent",
                  color: tab === key ? "white" : t.text2,
                  border: tab === key ? "none" : `1px solid ${t.border}`,
                  transition: "all 0.2s"
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ display: "flex", background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: "hidden", maxWidth: 400, marginBottom: 20 }}>
              <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "none", outline: "none", fontSize: 13, color: t.text, background: "transparent" }} />
              <span style={{ padding: "10px 14px", color: t.text2, fontSize: 16 }}>🔍</span>
            </div>

            {/* Course Grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: t.text2 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>
                  {tab === "my" ? "No courses yet" : "No courses found"}
                </div>
                <div style={{ fontSize: 13 }}>
                  {tab === "my" ? "Browse all courses and add some!" : "Try a different search term"}
                </div>
                {tab === "my" && (
                  <button onClick={() => setTab("browse")} style={{ marginTop: 16, background: t.btnBg, color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Browse Courses →
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {filtered.map((course, i) => {
                  const isEnrolled = myCourses.find(c => c.id === course.id);
                  return (
                    <div key={course.id} style={{ background: t.cardBg, border: `1px solid ${isEnrolled ? t.accent : t.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      <div style={{
                        height: 100, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                        background: thumbnails[course.id]
                          ? `#000 url(${thumbnails[course.id]}) center/cover no-repeat`
                          : cardColors[i % cardColors.length]
                      }}>
                        {thumbnails[course.id] && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
                        )}
                        <div style={{ position: "absolute", top: 8, left: 8, zIndex: 1, background: "#60A5FA", color: "#0F172A", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{course.department}</div>
                        {isEnrolled && <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1, background: "#22C55E", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>✓ Enrolled</div>}
                        <div style={{ zIndex: 1, width: 36, height: 36, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>▶</div>
                      </div>
                      <div style={{ padding: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 3 }}>{course.title}</div>
                        <div style={{ fontSize: 11, color: t.text2, marginBottom: 12, opacity: 0.8 }}>{course.instructor}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => toggleCourse(course)} style={{
                            flex: 1, padding: "7px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                            background: isEnrolled ? "rgba(239,68,68,0.1)" : t.btnBg,
                            color: isEnrolled ? "#EF4444" : "white",
                            transition: "all 0.2s"
                          }}>
                            {isEnrolled ? "Remove" : "+ Add"}
                          </button>
                          {isEnrolled && (
                            <button onClick={() => openPlaylist(course)} style={{ flex: 1, padding: "7px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: t.bg2, color: t.accent, border: `1px solid ${t.border}`, transition: "all 0.2s" }}>
                              ▶ Videos
                            </button>
                          )}
                          {isEnrolled && (
                            <button onClick={() => openNotes(course)} style={{ flex: 1, padding: "7px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", background: t.bg2, color: t.accent, border: `1px solid ${t.border}`, transition: "all 0.2s" }}>
                              📝 Notes
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <div>
            {!selectedCourse ? (
              <div style={{ textAlign: "center", padding: "48px", color: t.text2 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>No course selected</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Go to My Courses and click Notes on a course</div>
                <button onClick={() => setActiveTab("courses")} style={{ background: t.btnBg, color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Go to Courses →
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.text2, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes for</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{selectedCourse.title}</div>
                  </div>
                  <button onClick={handleSaveNote} disabled={saving} style={{ background: t.btnBg, color: "white", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "💾 Save Notes"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                  {/* Text Notes */}
                  <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>📄 Text Notes</div>
                    <textarea value={notes.text} onChange={e => setNotes(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Write your notes here..."
                      style={{ width: "100%", minHeight: 200, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px", fontSize: 13, color: t.text, outline: "none", resize: "vertical", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", lineHeight: 1.7 }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Highlights */}
                    <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>🌟 Key Highlights</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input type="text" placeholder="Add a highlight..." value={newHighlight} onChange={e => setNewHighlight(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addHighlight()}
                          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: t.text, outline: "none" }} />
                        <button onClick={addHighlight} style={{ background: t.btnBg, color: "white", border: "none", padding: "8px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto" }}>
                        {notes.highlights.map((h, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: dark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.06)", border: `1px solid ${dark ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.12)"}`, borderRadius: 7, padding: "8px 12px" }}>
                            <span style={{ fontSize: 12, color: t.accent }}>⭐</span>
                            <span style={{ flex: 1, fontSize: 12, color: t.text }}>{h}</span>
                            <button onClick={() => removeHighlight(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>✅ Checklist</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input type="text" placeholder="Add a task..." value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addCheckItem()}
                          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: t.text, outline: "none" }} />
                        <button onClick={addCheckItem} style={{ background: t.btnBg, color: "white", border: "none", padding: "8px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>+</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto" }}>
                        {notes.checklist.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                            <input type="checkbox" checked={item.done} onChange={() => toggleCheck(i)} style={{ cursor: "pointer", accentColor: t.accent, width: 15, height: 15 }} />
                            <span style={{ flex: 1, fontSize: 12, color: t.text, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
                            <button onClick={() => removeCheck(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}