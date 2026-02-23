from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.scenario import (
    CurrentScenarioOut,
    ScenarioLogOut,
    ScenarioStateOut,
    VALID_SCENARIOS,
)
from app.services.scenario_service import (
    activate_scenario,
    get_active_scenario,
    list_scenario_logs,
    reset_scenario,
)

router = APIRouter(prefix="/scenario", tags=["scenario"])


@router.post("/activate/{scenario_name}", response_model=ScenarioStateOut)
def activate(
    scenario_name: str,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> ScenarioStateOut:
    name = scenario_name.upper()
    if name not in VALID_SCENARIOS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario. Valid: {sorted(VALID_SCENARIOS)}",
        )
    state = activate_scenario(db, name)
    return state  # type: ignore[return-value]


@router.get("/current", response_model=CurrentScenarioOut)
def get_current(db: Session = Depends(get_db)) -> CurrentScenarioOut:
    active = get_active_scenario(db)
    if active:
        return CurrentScenarioOut(active=True, scenario=active, message=f"Scenario '{active.scenario_name}' is active")  # type: ignore[arg-type]
    return CurrentScenarioOut(active=False, scenario=None, message="No active scenario — normal simulation running")


@router.post("/reset", response_model=CurrentScenarioOut)
def reset(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> CurrentScenarioOut:
    reset_scenario(db)
    return CurrentScenarioOut(active=False, scenario=None, message="Scenario reset — normal simulation restored")


@router.get("/logs", response_model=list[ScenarioLogOut])
def get_logs(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ScenarioLogOut]:
    return list_scenario_logs(db, limit)  # type: ignore[return-value]
