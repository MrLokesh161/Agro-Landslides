from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import SensorData
from app.schemas.sensor import SensorDataOut

router = APIRouter(prefix="/sensor-history", tags=["sensor"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=list[SensorDataOut])
def list_sensor_history(
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
) -> list[SensorDataOut]:
    history = (
        db.query(SensorData)
        .order_by(SensorData.timestamp.desc())
        .limit(limit)
        .all()
    )
    return history
