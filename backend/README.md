# UniTube Backend

Backend API for **UniTube**, an educational platform where students can:

- Register and log in securely
- Select courses
- Watch curated YouTube playlists
- Take personal notes
- Manage courses through an admin panel

## Project Structure

```text
backend/
│
├── models.py          # Database models
├── schemas.py         # Pydantic schemas
├── database.py        # Database configuration
├── auth_utils.py      # JWT authentication utilities
├── dependencies.py    # Authentication & database dependencies
├── main.py            # FastAPI application entry point
│
├── routes/
│   ├── auth.py        # Authentication APIs
│   ├── courses.py     # Course management APIs
│   ├── playlist.py    # Playlist management APIs
│   └── notes.py       # Notes APIs
│
├── requirements.txt
└── .gitignore
```
