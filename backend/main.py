from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base

from routes import (
    auth,
    courses,
    playlist,
    notes
)


# =====================
# CREATE DATABASE TABLES
# =====================

Base.metadata.create_all(bind=engine)


# =====================
# FASTAPI APP
# =====================

app = FastAPI(
    title="UniTube API",
    version="1.0.0",
    description="Backend API for UniTube - Course Video Playlist Management System"
)


# =====================
# CORS CONFIGURATION
# =====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================
# ROUTES
# =====================

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(courses.router)
app.include_router(playlist.router)
app.include_router(notes.router)


# =====================
# HOME
# =====================

@app.get("/")
def home():
    return {
        "message": "Welcome to UniTube API",
        "status": "Running"
    }
