import type {
  Alert,
  AuthToken,
  CurrentScenario,
  DashboardLatest,
  ScenarioLog,
  ScenarioName,
  ScenarioState,
  SensorData,
  User,
} from "../types";

const BASE = "/api";

const TOKEN_KEY = "agriguard_token";

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function get<T>(path: string, auth = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown, auth = false): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    post<AuthToken>("/auth/login", { username, password }),
  signup: (username: string, email: string, password: string, full_name?: string) =>
    post<AuthToken>("/auth/signup", { username, email, password, full_name }),
  getProfile: () => get<User>("/profile/me", true),
  updateProfile: (payload: { email?: string; password?: string; full_name?: string }) =>
    put<User>("/profile/me", payload, true),

  // Dashboard / sensors
  getDashboardLatest: () => get<DashboardLatest>("/dashboard/latest"),
  getAlerts: () => get<Alert[]>("/alerts"),
  getSensorHistory: (limit = 60) => get<SensorData[]>(`/sensor-history?limit=${limit}`),

  // Irrigation
  getIrrigationStatus: () => get<any>("/irrigation-status"),
  updateIrrigation: (status: string, water_level: number) => post<any>("/irrigation-status/update", { status, water_level }, true),

  // Notifications
  getNotifications: () => get<any[]>("/notifications", true),
  markNotificationRead: (id: number) => post<any>(`/notifications/${id}/read`, {}, true),

  // Scenario
  activateScenario: (name: ScenarioName) =>
    post<ScenarioState>(`/scenario/activate/${name}`, {}, true),
  getCurrentScenario: () => get<CurrentScenario>("/scenario/current"),
  resetScenario: () => post<CurrentScenario>("/scenario/reset", {}, true),
  getScenarioLogs: (limit = 100) => get<ScenarioLog[]>(`/scenario/logs?limit=${limit}`),
};

