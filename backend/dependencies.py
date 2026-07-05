from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from database import SessionLocal
from models import User

from auth_utils import verify_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# =====================
# DATABASE SESSION
# =====================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =====================
# CURRENT USER
# =====================

def get_current_user(

    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)

):

    try:

        payload = verify_token(token)


        user_id = payload.get("user_id")


        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


    user = db.query(User).filter(
        User.user_id == user_id
    ).first()


    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =====================
# ADMIN CHECK
# =====================


def admin_required(

    user = Depends(get_current_user)

):

    if user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user
