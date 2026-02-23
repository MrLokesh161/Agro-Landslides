from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.core.database import Base


class ScenarioState(Base):
    __tablename__ = "scenario_states"

    id = Column(Integer, primary_key=True, index=True)
    scenario_name = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=False, nullable=False)
    activated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
