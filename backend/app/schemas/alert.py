from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AlertOut(BaseModel):
    id: int
    message: str
    severity: str
    reason: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
