import math
import random
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models import Alert, GateStatus, GateState, IrrigationStatus, IrrigationState, SensorData
from app.services.gate_logic import gate_state_for_risk
from app.services.irrigation_logic import irrigation_state_for_moisture
from app.services.risk_engine import calculate_risk
from app.services.scenario_service import generate_scenario_values, get_active_scenario


class SimulationState:
    def __init__(self) -> None:
        self.tick = 0
        self.water_pressure = 10.0
        self.tilt_angle = 1.0
        self.soil_moisture = 45.0
        self.rainfall = 0.0


_state = SimulationState()


def _simulate_rainfall(state: SimulationState) -> float:
    # Sine wave with noise to mimic rainfall cycles.
    base = (math.sin(state.tick / 12.0) + 1) * 20
    noise = random.uniform(-3, 3)
    rainfall = max(0.0, min(60.0, base + noise))
    return rainfall


def _update_water_pressure(state: SimulationState, rainfall: float) -> float:
    pressure = state.water_pressure
    if rainfall > 35:
        pressure += random.uniform(1.5, 3.5)
    elif rainfall > 15:
        pressure += random.uniform(0.2, 1.2)
    else:
        pressure -= random.uniform(0.2, 0.8)
    return max(0.0, min(120.0, pressure))


def _update_tilt(state: SimulationState, water_pressure: float) -> float:
    tilt = state.tilt_angle
    if water_pressure > 70:
        tilt += random.uniform(0.4, 1.0)
    elif water_pressure > 40:
        tilt += random.uniform(0.1, 0.3)
    else:
        tilt -= random.uniform(0.1, 0.3)
    return max(0.0, min(30.0, tilt))


def _update_soil_moisture(state: SimulationState, rainfall: float) -> float:
    moisture = state.soil_moisture + (rainfall * 0.2) + random.uniform(-2, 2)
    return max(5.0, min(95.0, moisture))


def _get_or_create_gate_status(db: Session, status: GateState) -> GateStatus:
    record = db.query(GateStatus).order_by(GateStatus.updated_at.desc()).first()
    if record is None:
        record = GateStatus(status=status, updated_at=datetime.utcnow())
        db.add(record)
    elif record.status != status:
        record = GateStatus(status=status, updated_at=datetime.utcnow())
        db.add(record)
    return record


def _get_or_create_irrigation_status(db: Session, status: IrrigationState) -> IrrigationStatus:
    record = db.query(IrrigationStatus).order_by(IrrigationStatus.updated_at.desc()).first()
    if record is None:
        record = IrrigationStatus(status=status, updated_at=datetime.utcnow())
        db.add(record)
    elif record.status != status:
        record = IrrigationStatus(status=status, updated_at=datetime.utcnow())
        db.add(record)
    return record


def _create_alert(db: Session, message: str, severity: str, reason: str | None = None) -> Alert:
    alert = Alert(message=message, severity=severity, reason=reason, timestamp=datetime.utcnow())
    db.add(alert)
    db.flush()
    # create a notification for the alert
    try:
        from app.services.notification_service import create_notification

        create_notification(db, message=f"Alert: {message}", type="alert", related_alert_id=alert.id, severity=severity)
    except Exception:
        # keep alert creation resilient; don't crash simulation if notification fails
        pass
    return alert


def run_simulation_step(db: Session) -> Optional[SensorData]:
    _state.tick += 1

    # --- Check for active scenario override ---
    active_scenario = get_active_scenario(db)

    if active_scenario:
        result = generate_scenario_values(active_scenario.scenario_name)
        if result is None:
            # LORA_OFFLINE packet drop — skip this tick entirely
            return None
        water_pressure, tilt_angle, soil_moisture, rainfall = result
        # Update internal state so gradual transitions carry over
        _state.water_pressure = water_pressure
        _state.tilt_angle = tilt_angle
        _state.soil_moisture = soil_moisture
        _state.rainfall = rainfall
    else:
        # Normal random simulation
        rainfall = _simulate_rainfall(_state)
        water_pressure = _update_water_pressure(_state, rainfall)
        tilt_angle = _update_tilt(_state, water_pressure)
        soil_moisture = _update_soil_moisture(_state, rainfall)
        _state.rainfall = rainfall
        _state.water_pressure = water_pressure
        _state.tilt_angle = tilt_angle
        _state.soil_moisture = soil_moisture

    risk_score, risk_level = calculate_risk(water_pressure, tilt_angle)
    gate_state = gate_state_for_risk(risk_level)
    irrigation_state = irrigation_state_for_moisture(soil_moisture)

    sensor = SensorData(
        water_pressure=water_pressure,
        tilt_angle=tilt_angle,
        soil_moisture=soil_moisture,
        rainfall=rainfall,
        risk_level=risk_level,
        timestamp=datetime.utcnow(),
    )
    db.add(sensor)

    _get_or_create_gate_status(db, gate_state)
    _get_or_create_irrigation_status(db, irrigation_state)

    if risk_level == "HIGH":
        _create_alert(db, "High landslide risk detected", "HIGH", reason="Calculated risk score exceeded HIGH threshold based on water pressure and tilt angle")
    elif risk_level == "MEDIUM" and risk_score > 60:
        _create_alert(db, "Moderate landslide risk detected", "MEDIUM", reason="Risk score in elevated MEDIUM range (threshold crossing)")

    db.commit()
    db.refresh(sensor)
    return sensor
