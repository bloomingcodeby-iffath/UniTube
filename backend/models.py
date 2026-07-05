from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, UniqueConstraint
from sqlalchemy.sql import func

from database import Base

# =====================
# USERS TABLE
# =====================

class User(Base):

    __tablename__ = "users"

    user_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    phone_number = Column(String(20))

    institution = Column(String(100))

    department = Column(String(100))

    batch = Column(String(50))

    year_semester = Column(String(50))

    role = Column(
        String(20),
        default="student",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=func.now()
    )



# =====================
# COURSES TABLE
# =====================

class Course(Base):

    __tablename__ = "courses"

    course_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_name = Column(
        String(100),
        nullable=False
    )

    description = Column(Text)

    course_type = Column(String(50))



# =====================
# USER SELECTED COURSES
# =====================

class StudentCourse(Base):

    __tablename__ = "student_courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )

    selected_at = Column(
        DateTime,
        default=func.now()
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "course_id",
            name="unique_user_course"
        ),
    )



# =====================
# PLAYLIST TABLE
# =====================

class Playlist(Base):

    __tablename__ = "playlist"

    playlist_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )

    playlist_title = Column(String(200))

    yt_url = Column(String(300))

    channel_name = Column(String(100))

    language = Column(String(50))



# =====================
# NOTES TABLE
# =====================

class Note(Base):

    __tablename__ = "notes"

    note_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )

    note_text = Column(Text)

    created_at = Column(
        DateTime,
        default=func.now()
    )
