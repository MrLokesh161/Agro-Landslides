from datetime import datetime

from pydantic import BaseModel

VALID_SCENARIOS = {"NORMAL", "HEAVY_RAIN", "LANDSLIDE_RISK", "DRY_SOIL", "LORA_OFFLINE"}


class ScenarioStateOut(BaseModel):
    id: int
    scenario_name: str
    is_active: bool
    activated_at: datetime

    class Config:
        from_attributes = True


class ScenarioLogOut(BaseModel):
    id: int
    scenario_name: str
    event_description: str
    timestamp: datetime

    class Config:
        from_attributes = True


class CurrentScenarioOut(BaseModel):
    active: bool
    scenario: ScenarioStateOut | None = None
    message: str
