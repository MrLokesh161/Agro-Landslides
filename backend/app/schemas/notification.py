from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    message: str
    type: str | None = None
    severity: str | None = None
    related_alert_id: int | None = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
