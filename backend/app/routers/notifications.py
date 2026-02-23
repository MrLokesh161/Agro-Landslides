from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Notification
from app.schemas.notification import NotificationOut
from app.services.notification_service import list_notifications, mark_notification_read

router = APIRouter(prefix="/notifications", tags=["notifications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db)) -> list[NotificationOut]:
    return list_notifications(db)


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: int, db: Session = Depends(get_db)) -> NotificationOut:
    n = mark_notification_read(db, notification_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n
