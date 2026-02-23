import { useState, useCallback } from "react";
import { api } from "../api";
import type { CurrentScenario, ScenarioLog, ScenarioName } from "../types";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import styles from "./ScenarioPanel.module.css";

const SCENARIOS: {
  name: ScenarioName;
  label: string;
  icon: string;
  description: string;
  tags: string[];
  color: string;
}[] = [
  {
    name: "NORMAL",
    label: "Normal",
    icon: "✅",
    description: "Standard sensor simulation with low pressure, minimal tilt, optimal soil moisture and light rainfall.",
    tags: ["Pressure: 20–40 kPa", "Tilt: 0–3°", "Moisture: 40–60%", "Rain: 0–5 mm/h"],
    color: "#22c55e",
  },
  {
    name: "HEAVY_RAIN",
    label: "Heavy Rain",
    icon: "⛈",
    description: "Simulates intense rainfall with gradually rising water pressure. Risk transitions LOW → MEDIUM → HIGH.",
    tags: ["Rainfall: 70–100 mm/h", "Pressure ramps to 85+", "Moisture increases", "Tilt creeps up"],
    color: "#3b82f6",
  },
  {
    name: "LANDSLIDE_RISK",
    label: "Landslide Risk",
    icon: "🏔",
    description: "Critical conditions — extreme pressure, high tilt. Triggers HIGH risk, closes gate and fires alerts.",
    tags: ["Pressure: 95–120 kPa", "Tilt: 8–15°", "Moisture: 70%+", "Gate: CLOSED"],
    color: "#ef4444",
  },
  {
    name: "DRY_SOIL",
    label: "Dry Soil",
    icon: "🏜",
    description: "Arid condition with very low soil moisture and zero rainfall. Triggers irrigation ON automatically.",
    tags: ["Moisture: 10–20%", "Pressure: low", "Rainfall: 0", "Irrigation: ON"],
    color: "#f59e0b",
  },
  {
    name: "LORA_OFFLINE",
    label: "LoRa Offline",
    icon: "📡",
    description: "Simulates unreliable LoRa link — 40% packet drop rate with random 0–1 s network delays.",
    tags: ["Packet loss: 40%", "Random delays", "Data gaps", "Memory queuing"],
    color: "#8b5cf6",
  },
];

export default function ScenarioPanel() {
  const [current, setCurrent] = useState<CurrentScenario | null>(null);
  const [logs, setLogs] = useState<ScenarioLog[]>([]);
  const [activating, setActivating] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [c, l] = await Promise.all([api.getCurrentScenario(), api.getScenarioLogs(20)]);
      setCurrent(c);
      setLogs(l);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useState(() => { refresh(); });
  useAutoRefresh(refresh, 5000);

  async function handleActivate(name: ScenarioName) {
    setActivating(name);
    try {
      await api.activateScenario(name);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActivating(null);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await api.resetScenario();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  }

  const activeScenarioName = current?.scenario?.scenario_name ?? null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Scenario Control</h1>
          <p className={styles.subtitle}>Demo and testing — manual environmental scenario injection</p>
        </div>
        <div className={styles.headerRight}>
          {current?.active ? (
            <div className={styles.activeIndicator}>
              <span className={styles.pulseDot} />
              <span>
                <strong>{current.scenario?.scenario_name}</strong> active
              </span>
            </div>
          ) : (
            <div className={styles.normalIndicator}>Normal simulation running</div>
          )}
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={resetting || !current?.active}
          >
            {resetting ? "Resetting…" : "Reset to Normal"}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Scenario Cards */}
      <div className={styles.grid}>
        {SCENARIOS.map((s) => {
          const isActive = activeScenarioName === s.name;
          const isLoading = activating === s.name;
          return (
            <div
              key={s.name}
              className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
              style={isActive ? { borderColor: s.color, boxShadow: `0 0 0 3px ${s.color}22` } : {}}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{s.icon}</span>
                <div>
                  <div className={styles.cardTitle}>{s.label}</div>
                  <div className={styles.cardName}>{s.name}</div>
                </div>
                {isActive && (
                  <span className={styles.activeBadge} style={{ background: `${s.color}22`, color: s.color, borderColor: `${s.color}55` }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p className={styles.cardDesc}>{s.description}</p>
              <div className={styles.tags}>
                {s.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
              <button
                className={styles.activateBtn}
                style={isActive ? { background: s.color } : {}}
                onClick={() => handleActivate(s.name)}
                disabled={isLoading || isActive}
              >
                {isLoading ? "Activating…" : isActive ? "Currently Active" : "Activate Scenario"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Scenario Logs */}
      <div className={styles.logsSection}>
        <h2 className={styles.logsTitle}>Scenario Event Log</h2>
        <div className={styles.logsWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Scenario</th>
                <th>Event</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.empty}>No scenario events yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.tdId}>{log.id}</td>
                    <td>
                      <span className={styles.logScenario}>{log.scenario_name}</span>
                    </td>
                    <td>{log.event_description}</td>
                    <td className={styles.tdTime}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
