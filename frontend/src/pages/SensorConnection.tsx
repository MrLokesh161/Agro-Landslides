import { useState, useCallback } from "react";
import { api } from "../api";
import type { SensorData } from "../types";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import styles from "./SensorConnection.module.css";

const SENSOR_NODES = [
  { id: "SENSOR-01", label: "Node A — Hill Slope",     icon: "📡" },
  { id: "SENSOR-02", label: "Node B — River Bank",     icon: "📡" },
  { id: "SENSOR-03", label: "Node C — Terrace Farm",   icon: "📡" },
];

function signalStrength(ts: string): { bars: number; label: string } {
  const age = (Date.now() - new Date(ts).getTime()) / 1000;
  if (age < 10) return { bars: 4, label: "Excellent" };
  if (age < 20) return { bars: 3, label: "Good" };
  if (age < 35) return { bars: 2, label: "Fair" };
  return { bars: 1, label: "Weak" };
}

function SignalBars({ bars }: { bars: number }) {
  return (
    <span className={styles.bars}>
      {[1, 2, 3, 4].map((b) => (
        <span key={b} className={`${styles.bar} ${bars >= b ? styles.barFilled : ""}`} />
      ))}
    </span>
  );
}

export default function SensorConnection() {
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    try {
      const history = await api.getSensorHistory(1);
      if (history.length > 0) {
        setLatest(history[0]);
        setLastUpdated(new Date());
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useState(() => { fetch(); });
  useAutoRefresh(fetch, 5000);

  const signal = latest ? signalStrength(latest.timestamp) : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sensor Connection</h1>
          <p className={styles.subtitle}>LoRa sensor node status and live telemetry</p>
        </div>
        {lastUpdated && (
          <span className={styles.timestamp}>Updated {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Node Status Grid */}
      <div className={styles.nodeGrid}>
        {SENSOR_NODES.map((node) => {
          const online = !!latest;
          return (
            <div key={node.id} className={`${styles.nodeCard} ${online ? styles.online : styles.offline}`}>
              <div className={styles.nodeTop}>
                <span className={styles.nodeIcon}>{node.icon}</span>
                <span className={`${styles.dot} ${online ? styles.dotOnline : styles.dotOffline}`} />
              </div>
              <div className={styles.nodeId}>{node.id}</div>
              <div className={styles.nodeLabel}>{node.label}</div>
              <div className={styles.nodeStatus}>{online ? "Online" : "Offline"}</div>
              {signal && online && (
                <div className={styles.signalRow}>
                  <SignalBars bars={signal.bars} />
                  <span className={styles.signalLabel}>{signal.label}</span>
                </div>
              )}
              {latest && (
                <div className={styles.lastSeen}>
                  Last packet: {new Date(latest.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Telemetry table */}
      {latest && (
        <div className={styles.telemetryCard}>
          <h2 className={styles.sectionTitle}>Live Telemetry — Latest Packet</h2>
          <div className={styles.telemetryGrid}>
            {[
              { label: "Water Pressure", value: latest.water_pressure.toFixed(2), unit: "kPa", icon: "💧" },
              { label: "Tilt Angle",     value: latest.tilt_angle.toFixed(3),      unit: "°",   icon: "📐" },
              { label: "Soil Moisture",  value: latest.soil_moisture.toFixed(2),   unit: "%",   icon: "🌱" },
              { label: "Rainfall",       value: latest.rainfall.toFixed(2),        unit: "mm/h",icon: "🌧" },
            ].map((item) => (
              <div className={styles.telItem} key={item.label}>
                <span className={styles.telIcon}>{item.icon}</span>
                <div>
                  <div className={styles.telLabel}>{item.label}</div>
                  <div className={styles.telValue}>
                    {item.value} <span className={styles.telUnit}>{item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.packetMeta}>
            <span>Packet ID: #{latest.id}</span>
            <span>Protocol: LoRa 868 MHz</span>
            <span>Risk: <strong>{latest.risk_level}</strong></span>
            <span>Received: {new Date(latest.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}

      {!latest && !error && (
        <div className={styles.loading}>Waiting for sensor packets…</div>
      )}
    </div>
  );
}
