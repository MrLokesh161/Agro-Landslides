from datetime import datetime

from pydantic import BaseModel, Field


class SensorDataOut(BaseModel):
    id: int
    water_pressure: float
    tilt_angle: float
    soil_moisture: float
    rainfall: float
    risk_level: str
    timestamp: datetime

    class Config:
        from_attributes = True


class SensorHistoryQuery(BaseModel):
    limit: int = Field(default=100, ge=1, le=1000)
