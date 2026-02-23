from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import GateStatus, IrrigationStatus, SensorData
from app.schemas.status import DashboardLatestOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/latest", response_model=DashboardLatestOut)
def get_latest_dashboard(db: Session = Depends(get_db)) -> DashboardLatestOut:
    sensor = db.query(SensorData).order_by(SensorData.timestamp.desc()).first()
    gate = db.query(GateStatus).order_by(GateStatus.updated_at.desc()).first()
    irrigation = db.query(IrrigationStatus).order_by(IrrigationStatus.updated_at.desc()).first()

    if sensor is None or gate is None or irrigation is None:
        raise HTTPException(status_code=404, detail="No data available")

    return DashboardLatestOut(sensor=sensor, gate=gate, irrigation=irrigation)
