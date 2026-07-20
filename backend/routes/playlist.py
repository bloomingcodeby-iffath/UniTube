from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import Playlist, Course
from schemas import PlaylistCreate

from dependencies import (
    get_current_user,
    admin_required,
    get_db
)

import os
import requests
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

router = APIRouter(
    prefix="/playlist",
    tags=["Playlist"]
)


# ==========================
# Extract Playlist ID
# ==========================

def extract_playlist_id(url: str):

    try:
        query = parse_qs(urlparse(url).query)
        return query.get("list", [None])[0]
    except:
        return None


# ==========================
# Fetch Playlist Info
# ==========================

def get_playlist_info(playlist_id: str):

    url = "https://www.googleapis.com/youtube/v3/playlists"

    params = {
        "part": "snippet",
        "id": playlist_id,
        "key": YOUTUBE_API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return None

    data = response.json()

    if len(data.get("items", [])) == 0:
        return None

    snippet = data["items"][0]["snippet"]

    return {
        "title": snippet["title"],
        "channel": snippet["channelTitle"]
    }


# ==========================
# ADMIN ADD PLAYLIST
# ==========================

@router.post("/add")
def add_playlist(

    playlist: PlaylistCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    # Check Course

    course = db.query(Course).filter(
        Course.course_id == playlist.course_id
    ).first()

    if course is None:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # Extract Playlist ID

    playlist_id = extract_playlist_id(playlist.yt_url)

    if playlist_id is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid Playlist URL"
        )

    # Fetch Playlist Information

    info = get_playlist_info(playlist_id)

    if info is None:
        raise HTTPException(
            status_code=400,
            detail="Playlist not found or API Key Invalid"
        )

    # Save

    new_playlist = Playlist(

        course_id=playlist.course_id,

        playlist_title=info["title"],

        yt_url=playlist.yt_url,

        channel_name=info["channel"],

        language=playlist.language

    )

    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)

    return {

        "message": "Playlist Added Successfully",

        "playlist_id": new_playlist.playlist_id,

        "playlist_title": new_playlist.playlist_title,

        "channel_name": new_playlist.channel_name

    }


# ==========================
# GET PLAYLIST BY COURSE
# ==========================

@router.get("/{course_id}")
def get_playlist(

    course_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):

    course = db.query(Course).filter(
        Course.course_id == course_id
    ).first()

    if course is None:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    playlists = db.query(Playlist).filter(

        Playlist.course_id == course_id

    ).all()

    return playlists


# ==========================
# DELETE PLAYLIST
# ==========================

@router.delete("/{playlist_id}")
def delete_playlist(

    playlist_id: int,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    playlist = db.query(Playlist).filter(

        Playlist.playlist_id == playlist_id

    ).first()

    if playlist is None:

        raise HTTPException(
            status_code=404,
            detail="Playlist not found"
        )

    db.delete(playlist)
    db.commit()

    return {

        "message": "Playlist Deleted"

    }