from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Integer, Float

from app.core.database import Base


class IrrigationState(str, Enum):
    ON = "ON"
    OFF = "OFF"


class IrrigationStatus(Base):
    __tablename__ = "irrigation_status"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(SqlEnum(IrrigationState), nullable=False, default=IrrigationState.OFF)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    # water level in liters (or percentage depending on your system)
    water_level = Column(Float, default=0.0, nullable=False)
