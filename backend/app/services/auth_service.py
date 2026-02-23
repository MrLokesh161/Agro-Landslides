from datetime import datetime, timedelta
from typing import Optional
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.auth import TokenData
from app.models.password_reset import PasswordResetToken
import secrets
from sqlalchemy import and_


# Pre-hash with SHA-256 so bcrypt always receives a fixed-size input (<72 bytes)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _pre_hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    return pwd_context.hash(_pre_hash(password))


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_pre_hash(plain), hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: Optional[str] = payload.get("sub")
        if username is None:
            return None
        return TokenData(username=username)
    except JWTError:
        return None


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def register_user(db: Session, username: str, email: str, password: str, full_name: Optional[str] = None) -> User:
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def validate_password_strength(password: str) -> None:
    # Basic complexity rules: min 8, must include lower, upper, digit, special
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not any(c.islower() for c in password):
        raise ValueError("Password must include a lowercase letter")
    if not any(c.isupper() for c in password):
        raise ValueError("Password must include an uppercase letter")
    if not any(c.isdigit() for c in password):
        raise ValueError("Password must include a digit")
    if not any(c in "!@#$%^&*()-_=+[]{};:,.<>?/\\|`~" for c in password):
        raise ValueError("Password must include a special character")


def create_password_reset_token(db: Session, email: str, expires_minutes: int = 60) -> str:
    user = get_user_by_email(db, email)
    # Always return a token for UX parity but only store if user exists
    token = secrets.token_urlsafe(32)
    if not user:
        return token
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    prt = PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(prt)
    db.commit()
    db.refresh(prt)
    return token


def consume_password_reset_token(db: Session, token: str, new_password: str) -> Optional[User]:
    validate_password_strength(new_password)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = datetime.utcnow()
    prt = (
        db.query(PasswordResetToken)
        .filter(and_(PasswordResetToken.token_hash == token_hash, PasswordResetToken.used == False, PasswordResetToken.expires_at > now))
        .first()
    )
    if not prt:
        return None
    user = db.query(User).filter(User.id == prt.user_id).first()
    if not user:
        return None
    # set new password
    user.hashed_password = hash_password(new_password)
    prt.used = True
    db.add(user)
    db.add(prt)
    db.commit()
    db.refresh(user)
    return user
