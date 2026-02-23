"""
Scenario Controller Service.

Manages active demo scenarios and generates sensor values accordingly.
Also handles the LORA_OFFLINE queue simulation.
"""
import collections
import random
import time
from datetime import datetime
from typing import Deque, Dict, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.scenario_log import ScenarioLog
from app.models.scenario_state import ScenarioState

# ---------------------------------------------------------------------------
# Scenario Names
# ---------------------------------------------------------------------------
SCENARIOS = {"NORMAL", "HEAVY_RAIN", "LANDSLIDE_RISK", "DRY_SOIL", "LORA_OFFLINE"}

# In-memory state for gradual transitions (HEAVY_RAIN ramp, LORA queue)
_heavy_rain_pressure: float = 20.0
_lora_queue: Deque[Dict] = collections.deque()


# ---------------------------------------------------------------------------
# Scenario Value Generators
# ---------------------------------------------------------------------------

def _normal_values() -> Tuple[float, float, float, float]:
    return (
        random.uniform(20, 40),
        random.uniform(0, 3),
        random.uniform(40, 60),
        random.uniform(0, 5),
    )


def _heavy_rain_values() -> Tuple[float, float, float, float]:
    global _heavy_rain_pressure
    # Very heavy rainfall with faster pressure ramp and increased tilt to drive HIGH risk
    rainfall = random.uniform(80, 120)
    _heavy_rain_pressure = min(120.0, _heavy_rain_pressure + random.uniform(4.0, 8.0))
    soil = random.uniform(70, 90)
    tilt = random.uniform(4.0, 12.0)
    return _heavy_rain_pressure, tilt, soil, rainfall


def _landslide_risk_values() -> Tuple[float, float, float, float]:
    return (
        random.uniform(95, 120),
        random.uniform(8, 15),
        random.uniform(70, 90),
        random.uniform(60, 80),
    )


def _dry_soil_values() -> Tuple[float, float, float, float]:
    return (
        random.uniform(5, 20),
        random.uniform(0, 1.5),
        random.uniform(10, 20),
        0.0,
    )


def _lora_offline_values() -> Optional[Tuple[float, float, float, float]]:
    """
    Simulate 40% packet loss and a random delay before DB flush.
    Returns None when the packet is dropped entirely.
    Queued packets are flushed when a successful tick happens.
    """
    dropped = random.random() < 0.40
    if dropped:
        return None
    time.sleep(random.uniform(0, 1))  # Up to 1-second network lag (capped for scheduler health)
    return (
        random.uniform(15, 50),
        random.uniform(0, 4),
        random.uniform(30, 60),
        random.uniform(0, 20),
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_active_scenario(db: Session) -> Optional[ScenarioState]:
    return (
        db.query(ScenarioState)
        .filter(ScenarioState.is_active == True)  # noqa: E712
        .order_by(ScenarioState.activated_at.desc())
        .first()
    )


def generate_scenario_values(
    scenario_name: str,
) -> Optional[Tuple[float, float, float, float]]:
    """
    Returns (water_pressure, tilt_angle, soil_moisture, rainfall) or None for dropped packets.
    """
    if scenario_name == "NORMAL":
        return _normal_values()
    if scenario_name == "HEAVY_RAIN":
        return _heavy_rain_values()
    if scenario_name == "LANDSLIDE_RISK":
        return _landslide_risk_values()
    if scenario_name == "DRY_SOIL":
        return _dry_soil_values()
    if scenario_name == "LORA_OFFLINE":
        return _lora_offline_values()
    return _normal_values()


def activate_scenario(db: Session, scenario_name: str) -> ScenarioState:
    global _heavy_rain_pressure
    if scenario_name not in SCENARIOS:
        raise ValueError(f"Unknown scenario: {scenario_name}")

    # Deactivate any currently active scenario.
    db.query(ScenarioState).filter(ScenarioState.is_active == True).update(  # noqa: E712
        {"is_active": False}, synchronize_session=False
    )

    if scenario_name == "HEAVY_RAIN":
        _heavy_rain_pressure = 40.0  # Reset ramp on activation (start higher)

    new_state = ScenarioState(
        scenario_name=scenario_name,
        is_active=True,
        activated_at=datetime.utcnow(),
    )
    db.add(new_state)

    log = ScenarioLog(
        scenario_name=scenario_name,
        event_description=f"Scenario '{scenario_name}' activated",
        timestamp=datetime.utcnow(),
    )
    db.add(log)

    db.commit()
    db.refresh(new_state)
    return new_state


def reset_scenario(db: Session) -> None:
    previous = get_active_scenario(db)
    db.query(ScenarioState).filter(ScenarioState.is_active == True).update(  # noqa: E712
        {"is_active": False}, synchronize_session=False
    )
    if previous:
        log = ScenarioLog(
            scenario_name=previous.scenario_name,
            event_description=f"Scenario '{previous.scenario_name}' deactivated — normal mode restored",
            timestamp=datetime.utcnow(),
        )
        db.add(log)
    db.commit()


def list_scenario_logs(db: Session, limit: int = 100) -> list:
    return (
        db.query(ScenarioLog)
        .order_by(ScenarioLog.timestamp.desc())
        .limit(limit)
        .all()
    )
