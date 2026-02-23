from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.schemas.auth import Token, UserCreate, UserLogin, UserOut
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    get_user_by_email,
    get_user_by_username,
    register_user,
)
from app.schemas.auth import PasswordResetRequest, PasswordResetConfirm
from app.services.auth_service import create_password_reset_token, consume_password_reset_token, validate_password_strength

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    if get_user_by_username(db, payload.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        user = register_user(db, payload.username, payload.email, payload.password, payload.full_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, user=user)  # type: ignore[arg-type]


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token({"sub": user.username})
    return Token(access_token=token, user=user)  # type: ignore[arg-type]



@router.post("/reset-request")
def reset_request(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    # For demo, we return the token in the response. In production send via email.
    token = create_password_reset_token(db, payload.email)
    return {"token": token}


@router.post("/reset")
def reset_confirm(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    # Validate and apply
    try:
        validate_password_strength(payload.new_password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    user = consume_password_reset_token(db, payload.token, payload.new_password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password reset successful"}
