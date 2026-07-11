# UniTube — Frontend

UniTube is a university course video library. Students register, pick their courses, and watch curated YouTube playlists/videos for each course inside the app — with notes, a personal dashboard, and light/dark mode.

This README covers the **frontend only** (React app). The backend (FastAPI + MySQL) is a separate project and must be running for this app to work.

---

## Tech Stack

- **React** (Create React App)
- **React Router** for page navigation (`react-router-dom`)
- Plain CSS-in-JS (inline styles) — no UI framework
- **AOS** for scroll animations on the About page
- YouTube **oEmbed** + **img.youtube.com** for course thumbnails (no API key required)

---

## Prerequisites

- **Node.js** (v16 or higher recommended) and npm
- The **UniTube backend** running locally (default: `http://localhost:8000`) — see the backend's own README for setup
- A modern browser (Chrome, Edge, Firefox)

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the `frontend` folder (same level as `package.json`):
   ```env
   REACT_APP_YOUTUBE_API_KEY=your_youtube_data_api_key
   ```
   This key is only used for the optional playlist video-expansion feature (`buildCourseVideoList` in `src/api/api.js`). The app will still run without it — you just won't get the expanded video list for playlist-type links.

3. Make sure the backend base URL in `src/api/api.js` matches where your backend is actually running:
   ```js
   const BASE = "http://localhost:8000";
   ```
   Change the port here if your backend runs elsewhere.

4. Start the dev server:
   ```bash
   npm start
   ```
   The app opens at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command         | Description                                  |
|-----------------|-----------------------------------------------|
| `npm start`     | Runs the app in development mode              |
| `npm run build` | Builds a production-ready bundle to `/build`  |
| `npm test`      | Runs the test runner (interactive watch mode) |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── api.js              # All backend API calls live here
│   ├── assets/                 # Hero images (light/dark)
│   ├── components/
│   │   ├── Navbar.jsx          # Top nav bar, shows login/logout state
│   │   ├── LoginModal.jsx      # "Login required" popup for guests
│   │   └── Playlistmodel.jsx   # Expands a playlist into individual videos
│   ├── data/
│   │   └── mockData.js         # Legacy mock data (kept for reference)
│   ├── pages/
│   │   ├── Home.jsx            # Landing page (search, departments, trending)
│   │   ├── About.jsx           # About / project info page
│   │   ├── Login.jsx           # Sign in
│   │   ├── Register.jsx        # Account creation
│   │   ├── Courses.jsx         # Full course library with filters/search
│   │   └── Dashboard.jsx       # Logged-in student's personal dashboard
│   ├── App.jsx                 # Route definitions + protected-route wrapper
│   └── index.js                # App entry point
└── package.json
```

---

## How Auth Works Here

- On login/register, the backend returns a JWT (`access_token`). The frontend stores it in `localStorage` under the key `token`, along with the user profile under `user`.
- Protected pages (`/courses`, `/dashboard`) redirect to `/login` if no token is found (see `Protected` wrapper in `App.jsx`).
- `Navbar.jsx` and `Home.jsx` check `localStorage.getItem("token")` to decide whether to show Login/Register or Dashboard/Logout.
- Logging out clears both `token` and `user` from `localStorage`.

---

## Key Features

- **Home page** — search bar, department shortcuts, and trending courses; all route into the Courses page pre-filtered via URL query params (`/courses?search=...` or `/courses?dept=...`).
- **Course Library** — browse/search/filter all courses by department, add/remove courses to your account.
- **Real YouTube thumbnails** — course cards pull an actual thumbnail from the course's first playlist entry (cached in-memory per session).
- **Dashboard** — manage enrolled courses, watch videos inline, and take notes per course.
- **Dark/Light mode** — toggled from the navbar, applied across all pages.

---

## Notes for Whoever Picks This Up Next

- `src/api/api.js` is the single source of truth for how the frontend talks to the backend — if a backend endpoint changes, this is the only file that should need updating.
- `Playlistmodel.jsx` is currently not imported anywhere in the app (an earlier prototype for showing playlist videos) — safe to wire in or remove depending on what's needed next.
- `src/data/mockData.js` is no longer used for real data (the app now hits the live backend) but is kept around in case it's useful for offline demos.