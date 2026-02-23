export interface SensorData {
  id: number;
  water_pressure: number;
  tilt_angle: number;
  soil_moisture: number;
  rainfall: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  timestamp: string;
}

export interface Alert {
  id: number;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  timestamp: string;
}

export type GateState = "OPEN" | "CLOSED" | "EMERGENCY_LOCK";
export type IrrigationState = "ON" | "OFF";

export interface GateStatus {
  id: number;
  status: GateState;
  updated_at: string;
}

export interface IrrigationStatus {
  id: number;
  status: IrrigationState;
  updated_at: string;
}

export interface DashboardLatest {
  sensor: SensorData;
  gate: GateStatus;
  irrigation: IrrigationStatus;
}

// Auth types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

// Scenario types
export type ScenarioName = "NORMAL" | "HEAVY_RAIN" | "LANDSLIDE_RISK" | "DRY_SOIL" | "LORA_OFFLINE";

export interface ScenarioState {
  id: number;
  scenario_name: ScenarioName;
  is_active: boolean;
  activated_at: string;
}

export interface ScenarioLog {
  id: number;
  scenario_name: string;
  event_description: string;
  timestamp: string;
}

export interface CurrentScenario {
  active: boolean;
  scenario: ScenarioState | null;
  message: string;
}

