from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class ScenarioLog(Base):
    __tablename__ = "scenario_logs"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(50), nullable=False, index=True)
    event_description = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
