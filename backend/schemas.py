from pydantic import BaseModel, EmailStr
from typing import Optional


# =====================
# USER SCHEMAS
# =====================

class UserCreate(BaseModel):

    username: str
    email: EmailStr
    password: str

    phone_number: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    year_semester: Optional[str] = None


class UserResponse(BaseModel):

    user_id: int
    username: str
    email: str
    phone_number: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    batch: Optional[str] = None
    year_semester: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):

    email: EmailStr
    password: str


class ForgotPassword(BaseModel):

    email: str


class ResetPassword(BaseModel):

    email: str
    new_password: str


# =====================
# UPDATE PROFILE
# =====================

class UpdateProfile(BaseModel):

    username: str

    phone_number: Optional[str] = None

    institution: Optional[str] = None

    department: Optional[str] = None

    batch: Optional[str] = None

    year_semester: Optional[str] = None


# =====================
# COURSE SCHEMAS
# =====================

class CourseCreate(BaseModel):

    course_name: str

    description: Optional[str] = None

    course_type: Optional[str] = None


class CourseResponse(BaseModel):

    course_id: int

    course_name: str

    description: Optional[str] = None

    course_type: Optional[str] = None

    class Config:
        from_attributes = True


# =====================
# PLAYLIST SCHEMAS
# =====================

class PlaylistCreate(BaseModel):

    course_id: int

    playlist_title: str

    yt_url: str

    channel_name: Optional[str] = None

    language: Optional[str] = None


class PlaylistResponse(BaseModel):

    playlist_id: int

    course_id: int

    playlist_title: str

    yt_url: str

    channel_name: Optional[str] = None

    language: Optional[str] = None

    class Config:
        from_attributes = True


# =====================
# NOTES SCHEMAS
# =====================

class NoteCreate(BaseModel):

    course_id: int

    note_text: str


class NoteResponse(BaseModel):

    note_id: int

    user_id: int

    course_id: int

    note_text: str

    class Config:
        from_attributes = True
