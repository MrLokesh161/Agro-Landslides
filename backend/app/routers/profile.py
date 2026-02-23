from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.database import SessionLocal
from app.models.user import User
from app.schemas.auth import UserOut, UserUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)) -> UserOut:
    return current_user  # type: ignore[return-value]


@router.put("/me", response_model=UserOut)
def update_my_profile(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> UserOut:
    # allow updating email, full_name and password
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.email = payload.email or user.email
    user.full_name = payload.full_name or user.full_name
    if payload.password:
        from app.services.auth_service import hash_password

        user.hashed_password = hash_password(payload.password)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user
