from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Notification


def create_notification(db: Session, message: str, type: Optional[str] = None, related_alert_id: Optional[int] = None, severity: Optional[str] = None) -> Notification:
    n = Notification(message=message, type=type, related_alert_id=related_alert_id, severity=severity)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def list_notifications(db: Session, limit: int = 100) -> List[Notification]:
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(limit).all()


def mark_notification_read(db: Session, notification_id: int) -> Optional[Notification]:
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        return None
    n.is_read = True
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
