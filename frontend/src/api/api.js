// ============================================================
// UniTube - api.js
// Connects the React frontend to the real FastAPI backend.
// Backend base URL - change if your backend runs on a different port.
// (Run backend with: uvicorn main:app --reload --port 8000)
// ============================================================

const BASE = "http://localhost:8000";

// ------------------------------------------------------------
// Small helper: parse JSON safely and throw on non-2xx so
// callers' try/catch blocks work like they already expect.
// ------------------------------------------------------------
async function handle(res) {
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const message = data.detail || data.message || "Request failed";
    throw new Error(message);
  }
  return data;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ====================
// AUTH
// ====================

// Backend login endpoint expects OAuth2 form data (username + password),
// NOT json. It returns { access_token, token_type } - no user object.
// So: login -> get token -> fetch /auth/me -> build a "user" object
// shaped the way the rest of the frontend (Dashboard etc.) expects.
export async function loginUser(email, password) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await handle(res); // { access_token, token_type }

  const token = data.access_token;

  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: authHeaders(token),
  });
  const me = await handle(meRes);

  return {
    token,
    user: mapUser(me),
  };
}

// Backend register expects: username, email, password, phone_number,
// institution, department, batch, year_semester (JSON body).
// It only returns { message, user_id } (no token), so we log the
// user in right after registering to keep the frontend flow the same.
export async function registerUser(data) {
  const payload = {
    username: data.name,
    email: data.email,
    password: data.password,
    institution: data.university || null,
    department: data.department || null,
    batch: null,
    year_semester: [data.year, data.semester].filter(Boolean).join(" - ") || null,
  };

  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handle(res); // { message, user_id }

  // auto-login right after successful registration
  return loginUser(data.email, data.password);
}

// Maps backend User shape -> shape the frontend UI already uses
// (user.name, user.university, user.department ...)
function mapUser(u) {
  return {
    id: u.user_id,
    name: u.username,
    email: u.email,
    university: u.institution,
    department: u.department,
    batch: u.batch,
    year_semester: u.year_semester,
    role: u.role,
  };
}

// ====================
// COURSES
// ====================

// Maps backend Course shape -> shape the frontend UI uses
// (course.id, course.title, course.department)
function mapCourse(c) {
  return {
    id: c.course_id,
    title: c.course_name,
    description: c.description,
    department: c.course_type,
  };
}

export async function getAllCourses(token) {
  const res = await fetch(`${BASE}/courses/`, {
    headers: authHeaders(token),
  });
  const courses = await handle(res);
  return { courses: courses.map(mapCourse) };
}

export async function getUserCourses(token) {
  const res = await fetch(`${BASE}/courses/my`, {
    headers: authHeaders(token),
  });
  const courses = await handle(res);
  return { courses: courses.map(mapCourse) };
}

// The backend has no "bulk save" endpoint - only
// POST /courses/select/{course_id} and DELETE /courses/remove/{course_id}.
// So we diff the desired list against what the student currently has
// and call select/remove for whatever changed.
export async function saveUserCourses(token, courseIds) {
  const current = await getUserCourses(token);
  const currentIds = current.courses.map((c) => c.id);

  const toAdd = courseIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !courseIds.includes(id));

  await Promise.all([
    ...toAdd.map((id) =>
      fetch(`${BASE}/courses/select/${id}`, {
        method: "POST",
        headers: authHeaders(token),
      })
    ),
    ...toRemove.map((id) =>
      fetch(`${BASE}/courses/remove/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      })
    ),
  ]);

  return { success: true, message: "Courses saved successfully" };
}

// Student selects one course (used directly by Courses.jsx / Dashboard.jsx)
export async function selectCourse(token, courseId) {
  const res = await fetch(`${BASE}/courses/select/${courseId}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handle(res);
}

// Student removes one course
export async function removeCourse(token, courseId) {
  const res = await fetch(`${BASE}/courses/remove/${courseId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return handle(res);
}

// ====================
// PLAYLIST
// ====================

// Backend returns a plain array of playlist rows for a course:
// [{ playlist_id, course_id, playlist_title, yt_url, channel_name, language }]
// Wrapped as { playlists: [...] } to match how Courses.jsx / Dashboard.jsx use it.
export async function getPlaylist(token, courseId) {
  const res = await fetch(`${BASE}/playlist/${courseId}`, {
    headers: authHeaders(token),
  });
  const playlists = await handle(res);
  return { playlists };
}

function extractYtPlaylistId(url) {
  const m = url?.match(/[?&]list=([^&]+)/);
  return m ? m[1] : null;
}

function extractYtVideoId(url) {
  const watchMatch = url?.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url?.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

// Used by components/Playlistmodel.jsx. Takes the raw playlist rows from
// the backend and, using the YouTube Data API (REACT_APP_YOUTUBE_API_KEY
// in frontend/.env), expands each yt_url into a flat list of individual
// videos { videoId, title, thumbnail } for the in-app player/sidebar.
export async function buildCourseVideoList(playlistEntries) {
  const YT_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
  if (!YT_KEY) return [];

  const results = [];

  for (const entry of playlistEntries) {
    const playlistId = extractYtPlaylistId(entry.yt_url);

    if (playlistId) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YT_KEY}`
        );
        const data = await res.json();
        (data.items || []).forEach((item) => {
          const vid = item.snippet?.resourceId?.videoId;
          if (vid) {
            results.push({
              videoId: vid,
              title: item.snippet.title,
              thumbnail:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url,
            });
          }
        });
        continue;
      } catch {
        // fall through and try to treat it as a single video below
      }
    }

    const videoId = extractYtVideoId(entry.yt_url);
    if (videoId) {
      results.push({
        videoId,
        title: entry.playlist_title || "Video",
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });
    }
  }

  return results;
}

// Simple in-memory cache so we don't re-fetch the same course's
// thumbnail every time the Courses/Dashboard page re-renders.
const thumbnailCache = {};

// Returns a real YouTube thumbnail URL for a course, based on its
// first playlist entry - or null if the course has no playlist yet.
export async function getCourseThumbnail(token, courseId) {
  if (courseId in thumbnailCache) return thumbnailCache[courseId];

  try {
    const { playlists } = await getPlaylist(token, courseId);
    if (!playlists || playlists.length === 0) {
      thumbnailCache[courseId] = null;
      return null;
    }

    const first = playlists[0];

    // direct video link -> YouTube gives us a thumbnail with no API key needed
    const videoId = extractYtVideoId(first.yt_url);
    if (videoId) {
      const url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      thumbnailCache[courseId] = url;
      return url;
    }

    // playlist-only link (no single video id in the URL) - ask YouTube's
    // public oEmbed endpoint for the first video's thumbnail (no API key)
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(first.yt_url)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        thumbnailCache[courseId] = data.thumbnail_url || null;
        return thumbnailCache[courseId];
      }
    } catch {
      // ignore, fall through to null
    }

    thumbnailCache[courseId] = null;
    return null;
  } catch {
    thumbnailCache[courseId] = null;
    return null;
  }
}

// ====================
// NOTES
// ====================
// Backend only stores one text field per note (note_text) and only
// has /notes/add, /notes/my and /notes/{note_id} (delete) - there is
// no "get notes for one course" and no "update note" endpoint.
// So: we JSON-stringify the frontend's note object {text, highlights,
// checklist} into note_text, and to "save" we delete any existing
// note(s) for that course for this user, then add a fresh one.

export async function getNotes(token, courseId) {
  const res = await fetch(`${BASE}/notes/my`, {
    headers: authHeaders(token),
  });
  const allNotes = await handle(res);

  const courseNotes = allNotes.filter((n) => n.course_id === courseId);
  if (courseNotes.length === 0) {
    return { notes: { text: "", highlights: [], checklist: [] } };
  }

  // most recently added note for this course wins
  const latest = courseNotes[courseNotes.length - 1];
  let parsed;
  try {
    parsed = JSON.parse(latest.note_text);
  } catch {
    parsed = { text: latest.note_text || "", highlights: [], checklist: [] };
  }
  return { notes: parsed };
}

export async function saveNote(token, courseId, noteData) {
  // remove old note(s) for this course so we don't pile up duplicates
  const res = await fetch(`${BASE}/notes/my`, {
    headers: authHeaders(token),
  });
  const allNotes = await handle(res);
  const oldNotes = allNotes.filter((n) => n.course_id === courseId);

  await Promise.all(
    oldNotes.map((n) =>
      fetch(`${BASE}/notes/${n.note_id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      })
    )
  );

  const addRes = await fetch(`${BASE}/notes/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({
      course_id: courseId,
      note_text: JSON.stringify(noteData),
    }),
  });
  await handle(addRes);

  return { success: true, message: "Note saved successfully" };
}