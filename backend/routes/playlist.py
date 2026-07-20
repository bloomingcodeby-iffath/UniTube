from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import Playlist, Course
from schemas import PlaylistCreate

from dependencies import (
    get_current_user,
    admin_required,
    get_db
)

router = APIRouter(
    prefix="/playlist",
    tags=["Playlist"]
)


# =====================
# ADMIN ADD PLAYLIST
# =====================

@router.post("/add")
def add_playlist(

    playlist: PlaylistCreate,
    db: Session = Depends(get_db),
    admin=Depends(admin_required)

):

    course = db.query(Course).filter(
        Course.course_id == playlist.course_id
    ).first()

    if course is None:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    new_playlist = Playlist(

        course_id=playlist.course_id,
        playlist_title=playlist.playlist_title,
        yt_url=playlist.yt_url,
        channel_name=playlist.channel_name,
        language=playlist.language

    )

    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)

    return {

        "message": "Playlist added",
        "playlist_id": new_playlist.playlist_id

    }


# =====================
# GET PLAYLIST BY COURSE
# =====================

@router.get("/{course_id}")
def get_playlist(

    course_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):

    # Check if course exists
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


# =====================
# ADMIN DELETE PLAYLIST
# =====================

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

        "message": "Playlist deleted"

    }
