import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserCourses, getAllCourses, selectCourse, removeCourse, getNotes, saveNote, getPlaylist, getCourseThumbnail, getAllUserNotes, deleteNotesForCourse } from "../api/api";
import useIsMobile from "../hooks/useIsMobile";

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
  const [saveMessage, setSaveMessage] = useState("");
  const [tab, setTab] = useState("my"); // my | browse
  const [viewingCourse, setViewingCourse] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [playlistItems, setPlaylistItems] = useState([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [notedCourses, setNotedCourses] = useState([]);
  const [loadingNotedCourses, setLoadingNotedCourses] = useState(false);

  const token = localStorage.getItem("token");
  const isMobile = useIsMobile();

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
    setSelectedCourse(course);
    setLoadingPlaylist(true);
    try {
      const [playlistRes, notesRes] = await Promise.all([
        getPlaylist(token, course.id),
        getNotes(token, course.id),
      ]);
      setPlaylistItems(playlistRes.playlists || []);
      setNotes(notesRes.notes || { text: "", highlights: [], checklist: [] });
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

  // Builds the "courses I've taken notes on" list shown when opening the
  // Notes tab - matches each distinct course_id found in the student's
  // notes against their enrolled/browsable courses to get a display name.
  async function loadNotedCourses() {
    setLoadingNotedCourses(true);
    try {
      const allNotes = await getAllUserNotes(token);
      const courseIds = [...new Set(allNotes.map(n => n.course_id))];
      const combined = [...myCourses, ...allCourses];
      const matched = courseIds
        .map(id => combined.find(c => c.id === id))
        .filter(Boolean);
      const unique = Array.from(new Map(matched.map(c => [c.id, c])).values());
      setNotedCourses(unique);
    } catch {
      setNotedCourses([]);
    }
    setLoadingNotedCourses(false);
  }

  // Top-level tab click: switching to Notes always shows the list of
  // courses that already have notes, rather than jumping straight into
  // whichever note was edited most recently.
  function handleTabClick(key) {
    if (key === "notes") {
      setSelectedCourse(null);
      loadNotedCourses();
    }
    setActiveTab(key);
  }

  function backToNotesList() {
    setSelectedCourse(null);
  }

  async function handleDeleteNotes(e, course) {
    e.stopPropagation(); // don't trigger the card's own onClick (openNotes)

    await deleteNotesForCourse(token, course.id);
    setNotedCourses(prev => prev.filter(c => c.id !== course.id));

    if (selectedCourse?.id === course.id) {
      setSelectedCourse(null);
      setNotes({ text: "", highlights: [], checklist: [] });
    }
  }

  async function handleSaveNote() {
    if (!selectedCourse) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await saveNote(token, selectedCourse.id, notes);
      setNotedCourses(prev => prev.some(c => c.id === selectedCourse.id) ? prev : [...prev, selectedCourse]);
      setSaveMessage("✓ Note saved");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch {
      setSaveMessage("Failed to save note");
      setTimeout(() => setSaveMessage(""), 2500);
    }
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

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Burning the midnight oil" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Working late";

  const checklistDone = notes.checklist.filter(i => i.done).length;

  const t = {
    bg: dark ? "#0B1220" : "#F7F8FB",
    bg2: dark ? "#1E293B" : "#EFF6FF",
    text: dark ? "#F1F5F9" : "#111827",
    text2: dark ? "#93B4E8" : "#2563EB",
    cardBg: dark ? "#161F32" : "#ffffff",
    border: dark ? "#263248" : "#E4E9F5",
    navBg: dark ? "#0A0F1E" : "#1E3A5F",
    inputBg: dark ? "#0F172A" : "#F8FAFF",
    btnBg: dark ? "#2563EB" : "#1E3A5F",
    accent: dark ? "#60A5FA" : "#2563EB",
    amber: "#F0A93A",
    paper: dark ? "#141C2E" : "#FFFDF7",
    paperLine: dark ? "rgba(96,165,250,0.08)" : "rgba(30,58,95,0.07)",
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

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: isMobile ? "20px 16px" : "32px 40px" }}>

        {/* Welcome — mesh-gradient hero with stats */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: "radial-gradient(120% 160% at 0% 0%, #2E5A9B 0%, #1E3A5F 45%, #0F1F38 100%)",
          borderRadius: 20, padding: "34px 36px", marginBottom: 30,
        }}>
          {/* decorative glow blobs */}
          <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.35), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, left: "30%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,169,58,0.18), transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FBBF6C", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                {greeting}
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 6, letterSpacing: "-0.02em" }}>
                {user?.name} 👋
              </h2>
              <p style={{ fontSize: 13, color: "#B7CCEE" }}>{user?.department} • {user?.university} • •  {user?.year_semester}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              {/* mini stats */}
              <div style={{ display: "flex", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{myCourses.length}</div>
                  <div style={{ fontSize: 10, color: "#B7CCEE", textTransform: "uppercase", letterSpacing: "0.06em" }}>Enrolled</div>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{allCourses.length}</div>
                  <div style={{ fontSize: 10, color: "#B7CCEE", textTransform: "uppercase", letterSpacing: "0.06em" }}>Available</div>
                </div>
              </div>

              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.15)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => navigate("/profile")} style={{
                  background: "rgba(255,255,255,0.14)", color: "white",
                  border: "1px solid rgba(255,255,255,0.28)", padding: "9px 16px",
                  borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}>
                  ✏️ Edit Profile
                </button>
                <div onClick={() => navigate("/profile")} style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "linear-gradient(135deg,#FBBF6C,#F0A93A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800, color: "#1E1002", cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(240,169,58,0.35)"
                }}>
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["courses", "📚 My Courses"], ["notes", "📝 Notes"]].map(([key, label]) => (
            <button key={key} onClick={() => handleTabClick(key)} style={{
              padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: activeTab === key ? t.btnBg : t.cardBg,
              color: activeTab === key ? "white" : t.text2,
              border: activeTab === key ? "none" : `1px solid ${t.border}`,
              boxShadow: activeTab === key ? "0 6px 16px rgba(37,99,235,0.25)" : "none",
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
                  padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
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
            <div style={{ display: "flex", background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: "hidden", maxWidth: 400, marginBottom: 22 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                {filtered.map((course, i) => {
                  const isEnrolled = myCourses.find(c => c.id === course.id);
                  return (
                    <div key={course.id} style={{
                      background: t.cardBg, borderRadius: 16, overflow: "hidden",
                      border: `1px solid ${isEnrolled ? t.accent : t.border}`,
                      boxShadow: isEnrolled ? `0 0 0 3px ${dark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)"}` : "none",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = dark ? "0 14px 30px rgba(0,0,0,0.4)" : "0 14px 30px rgba(37,99,235,0.14)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isEnrolled ? `0 0 0 3px ${dark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)"}` : "none"; }}>
                      <div style={{
                        height: 104, position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                        background: thumbnails[course.id]
                          ? `#000 url(${thumbnails[course.id]}) center/cover no-repeat`
                          : cardColors[i % cardColors.length]
                      }}>
                        {thumbnails[course.id] && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
                        )}
                        {/* filmstrip notches - signature detail tying back to "video library" */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, display: "flex", justifyContent: "space-evenly", zIndex: 1 }}>
                          {Array.from({ length: 10 }).map((_, k) => (
                            <div key={k} style={{ width: 5, height: 5, marginTop: 1, borderRadius: 1, background: "rgba(255,255,255,0.5)" }} />
                          ))}
                        </div>
                        <div style={{ position: "absolute", top: 10, left: 8, zIndex: 1, background: "#60A5FA", color: "#0F172A", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{course.department}</div>
                        {isEnrolled && <div style={{ position: "absolute", top: 10, right: 8, zIndex: 1, background: "#22C55E", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>✓ Enrolled</div>}
                        <div style={{ zIndex: 1, width: 38, height: 38, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>▶</div>
                      </div>
                      <div style={{ padding: 15 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3, lineHeight: 1.3 }}>{course.title}</div>
                        <div style={{ fontSize: 11, color: t.text2, marginBottom: 13, opacity: 0.8 }}>{course.instructor}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => toggleCourse(course)} style={{
                            flex: 1, padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none",
                            background: isEnrolled ? "rgba(239,68,68,0.1)" : t.btnBg,
                            color: isEnrolled ? "#EF4444" : "white",
                            transition: "all 0.2s"
                          }}>
                            {isEnrolled ? "Remove" : "+ Add"}
                          </button>
                          {isEnrolled && (
                            <button onClick={() => openPlaylist(course)} style={{ flex: 1, padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: t.bg2, color: t.accent, border: `1px solid ${t.border}`, transition: "all 0.2s" }}>
                              ▶ Videos
                            </button>
                          )}
                          {isEnrolled && (
                            <button onClick={() => openNotes(course)} style={{ flex: 1, padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: t.bg2, color: t.accent, border: `1px solid ${t.border}`, transition: "all 0.2s" }}>
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
              loadingNotedCourses ? (
                <div style={{ textAlign: "center", padding: "48px", color: t.text2 }}>Loading your notes...</div>
              ) : notedCourses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: t.text2 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>No notes yet</div>
                  <div style={{ fontSize: 13, marginBottom: 16 }}>Go to My Courses and click Notes on a course to start writing</div>
                  <button onClick={() => setActiveTab("courses")} style={{ background: t.btnBg, color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Go to Courses →
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, color: t.text2, marginBottom: 14 }}>Courses you've taken notes on — click one to open it</div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14 }}>
                    {notedCourses.map(course => (
                      <div key={course.id} onClick={() => openNotes(course)} style={{
                        background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14,
                        padding: 18, cursor: "pointer", transition: "all 0.2s", position: "relative"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = t.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; }}>
                        <button onClick={(e) => handleDeleteNotes(e, course)} title="Delete notes" style={{
                          position: "absolute", top: 10, right: 10, background: "none", border: "none",
                          color: "#EF4444", cursor: "pointer", fontSize: 14, padding: 4, opacity: 0.7,
                          transition: "opacity 0.2s"
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0.7}>
                          🗑️
                        </button>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>📔</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 3, paddingRight: 20 }}>{course.title}</div>
                        <div style={{ fontSize: 11, color: t.text2, opacity: 0.8 }}>{course.department}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <button onClick={backToNotesList} style={{ background: "none", border: "none", color: t.text2, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8 }}>
                      ← All notes
                    </button>
                    <div style={{ fontSize: 11, color: t.text2, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Notes for</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{selectedCourse.title}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {saveMessage && (
                      <span style={{ fontSize: 13, fontWeight: 600, color: saveMessage.includes("Failed") ? "#EF4444" : "#22C55E" }}>
                        {saveMessage}
                      </span>
                    )}
                    <button onClick={handleSaveNote} disabled={saving} style={{ background: t.btnBg, color: "white", border: "none", padding: "10px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1, boxShadow: "0 6px 16px rgba(37,99,235,0.25)" }}>
                      {saving ? "Saving..." : "💾 Save Notes"}
                    </button>
                    <button onClick={(e) => handleDeleteNotes(e, selectedCourse)} style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", padding: "10px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

                  {/* Text Notes — notebook paper look, this is the signature element */}
                  <div style={{

                    background: t.paper, border: `1px solid ${t.border}`, borderRadius: 14, padding: "20px 20px 20px 28px",
                    position: "relative", overflow: "hidden"
                  }}>
                    {/* spiral-binding edge */}
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 18, background: dark ? "rgba(96,165,250,0.06)" : "rgba(30,58,95,0.04)", borderRight: `1px dashed ${t.border}` }}>
                      {Array.from({ length: 14 }).map((_, k) => (
                        <div key={k} style={{ width: 6, height: 6, borderRadius: "50%", background: t.bg, border: `1px solid ${t.border}`, margin: "16px auto 0" }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>📄 Text Notes</div>
                    <textarea value={notes.text} onChange={e => setNotes(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Write your notes here..."
                      style={{
                        width: "100%", minHeight: 200, background: "transparent", border: "none", outline: "none",
                        fontSize: 13, color: t.text, resize: "vertical", fontFamily: "'Segoe UI', sans-serif",
                        boxSizing: "border-box", lineHeight: "28px",
                        backgroundImage: `repeating-linear-gradient(${t.paper}, ${t.paper} 27px, ${t.paperLine} 27px, ${t.paperLine} 28px)`,
                        backgroundAttachment: "local",
                      }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Highlights */}
                    <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 12 }}>🌟 Key Highlights</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input type="text" placeholder="Add a highlight..." value={newHighlight} onChange={e => setNewHighlight(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addHighlight()}
                          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: t.text, outline: "none" }} />
                        <button onClick={addHighlight} style={{ background: t.amber, color: "#1E1002", border: "none", padding: "8px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>+</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 140, overflowY: "auto" }}>
                        {notes.highlights.map((h, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: dark ? "rgba(240,169,58,0.1)" : "rgba(240,169,58,0.08)", border: `1px solid ${dark ? "rgba(240,169,58,0.25)" : "rgba(240,169,58,0.2)"}`, borderRadius: 7, padding: "8px 12px" }}>
                            <span style={{ fontSize: 12, color: t.amber }}>⭐</span>
                            <span style={{ flex: 1, fontSize: 12, color: t.text }}>{h}</span>
                            <button onClick={() => removeHighlight(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklist */}
                    <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>✅ Checklist</div>
                        {notes.checklist.length > 0 && (
                          <div style={{ fontSize: 11, color: t.text2, fontWeight: 600 }}>{checklistDone}/{notes.checklist.length} done</div>
                        )}
                      </div>
                      {notes.checklist.length > 0 && (
                        <div style={{ height: 5, borderRadius: 3, background: t.inputBg, marginBottom: 14, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(checklistDone / notes.checklist.length) * 100}%`, background: "linear-gradient(90deg,#22C55E,#4ADE80)", transition: "width 0.3s" }} />
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <input type="text" placeholder="Add a task..." value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addCheckItem()}
                          style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 7, padding: "8px 12px", fontSize: 12, color: t.text, outline: "none" }} />
                        <button onClick={addCheckItem} style={{ background: t.btnBg, color: "white", border: "none", padding: "8px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer", fontWeight: 700 }}>+</button>
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

      {/* Video + Notes split view */}
      {viewingCourse && (
        <div onClick={closePlaylist} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: t.cardBg, borderRadius: 16, maxWidth: 1200, width: "100%", maxHeight: "92vh", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: isMobile ? "auto" : "hidden" }}>

            {/* LEFT: video(s) */}
            <div style={{ flex: isMobile ? "none" : 1, minWidth: 0, padding: 28, overflowY: isMobile ? "visible" : "auto" }}>
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

            {/* RIGHT: notes for this course, editable while the video plays */}
            <div style={{ width: isMobile ? "100%" : 340, flexShrink: 0, borderLeft: isMobile ? "none" : `1px solid ${t.border}`, borderTop: isMobile ? `1px solid ${t.border}` : "none", padding: 20, overflowY: isMobile ? "visible" : "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>📝 Notes</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {saveMessage && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: saveMessage.includes("Failed") ? "#EF4444" : "#22C55E" }}>
                      {saveMessage}
                    </span>
                  )}
                  <button onClick={handleSaveNote} disabled={saving} style={{ background: t.btnBg, color: "white", border: "none", padding: "6px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "💾 Save"}
                  </button>
                </div>
              </div>

              <textarea value={notes.text} onChange={e => setNotes(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Write your notes while watching..."
                style={{ width: "100%", minHeight: 160, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "10px", fontSize: 12, color: t.text, outline: "none", resize: "vertical", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", lineHeight: 1.6 }} />

              {/* Highlights */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 8 }}>🌟 Highlights</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input type="text" placeholder="Add a highlight..." value={newHighlight} onChange={e => setNewHighlight(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addHighlight()}
                    style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: t.text, outline: "none" }} />
                  <button onClick={addHighlight} style={{ background: t.btnBg, color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 100, overflowY: "auto" }}>
                  {notes.highlights.map((h, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: dark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.06)", border: `1px solid ${dark ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.12)"}`, borderRadius: 6, padding: "6px 10px" }}>
                      <span style={{ fontSize: 11, color: t.accent }}>⭐</span>
                      <span style={{ flex: 1, fontSize: 11, color: t.text }}>{h}</span>
                      <button onClick={() => removeHighlight(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 8 }}>✅ Checklist</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input type="text" placeholder="Add a task..." value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCheckItem()}
                    style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 11, color: t.text, outline: "none" }} />
                  <button onClick={addCheckItem} style={{ background: t.btnBg, color: "white", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 100, overflowY: "auto" }}>
                  {notes.checklist.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
                      <input type="checkbox" checked={item.done} onChange={() => toggleCheck(i)} style={{ cursor: "pointer", accentColor: t.accent, width: 13, height: 13 }} />
                      <span style={{ flex: 1, fontSize: 11, color: t.text, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
                      <button onClick={() => removeCheck(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      <Footer t={t} />
    </div>
  );
}