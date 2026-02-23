from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Integer

from app.core.database import Base


class GateState(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    EMERGENCY_LOCK = "EMERGENCY_LOCK"


class GateStatus(Base):
    __tablename__ = "gate_status"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(SqlEnum(GateState), nullable=False, default=GateState.OPEN)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
