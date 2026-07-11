import { mockCourses } from "../data/mockData";

const USE_MOCK = true;
const BASE = "http://localhost:3000";

// ====================
// AUTH
// ====================

export async function loginUser(email, password) {
  if (USE_MOCK) {
    return {
      token: "demo-token",
      user: {
        id: 1,
        name: "Demo User",
        email: email,
        department: "CSE",
      },
    };
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

export async function registerUser(data) {
  if (USE_MOCK) {
    return {
      token: "demo-token",
      user: {
        id: 1,
        name: data.name,
        email: data.email,
        department: data.department,
      },
    };
  }

  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// ====================
// COURSES
// ====================

export async function getAllCourses(token) {
  if (USE_MOCK) {
    return {
      courses: mockCourses,
    };
  }

  const res = await fetch(`${BASE}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function getUserCourses(token) {
  if (USE_MOCK) {
    return {
      courses: JSON.parse(localStorage.getItem("myCourses")) || [],
    };
  }

  const res = await fetch(`${BASE}/user/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function saveUserCourses(token, courseIds) {
  if (USE_MOCK) {
    localStorage.setItem("myCourses", JSON.stringify(courseIds));

    return {
      success: true,
      message: "Courses saved successfully",
    };
  }

  const res = await fetch(`${BASE}/user/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course_ids: courseIds,
    }),
  });

  return res.json();
}

// ====================
// NOTES
// ====================

export async function getNotes(token, courseId) {
  if (USE_MOCK) {
    const notes =
      JSON.parse(localStorage.getItem(`notes_${courseId}`)) || [];

    return {
      notes,
    };
  }

  const res = await fetch(`${BASE}/notes/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function saveNote(token, courseId, noteData) {
  if (USE_MOCK) {
    const notes =
      JSON.parse(localStorage.getItem(`notes_${courseId}`)) || [];

    notes.push(noteData);

    localStorage.setItem(
      `notes_${courseId}`,
      JSON.stringify(notes)
    );

    return {
      success: true,
      message: "Note saved successfully",
    };
  }

  const res = await fetch(`${BASE}/notes/${courseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });

  return res.json();
}