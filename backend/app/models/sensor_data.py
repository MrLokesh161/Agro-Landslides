from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.core.database import Base


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    water_pressure = Column(Float, nullable=False)
    tilt_angle = Column(Float, nullable=False)
    soil_moisture = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
