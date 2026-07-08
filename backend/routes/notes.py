from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import Note, Course
from schemas import NoteCreate

from dependencies import (
    get_current_user,
    get_db
)

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


# =====================
# ADD NOTE
# =====================

@router.post("/add")
def add_note(

    data: NoteCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):

    # Check if course exists
    course = db.query(Course).filter(
        Course.course_id == data.course_id
    ).first()

    if course is None:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    new_note = Note(

        user_id=user.user_id,
        course_id=data.course_id,
        note_text=data.note_text

    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return {

        "message": "Note added",
        "note_id": new_note.note_id

    }


# =====================
# MY NOTES
# =====================

@router.get("/my")
def my_notes(

    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):

    notes = db.query(Note).filter(

        Note.user_id == user.user_id

    ).all()

    return notes


# =====================
# DELETE NOTE
# =====================

@router.delete("/{note_id}")
def delete_note(

    note_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):

    note = db.query(Note).filter(

        Note.note_id == note_id,
        Note.user_id == user.user_id

    ).first()

    if note is None:

        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    return {

        "message": "Note deleted"

    }
