import { useState, useCallback } from "react";
import { api } from "../api";
import type { DashboardLatest } from "../types";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import MetricCard from "../components/cards/MetricCard";
import RiskBadge from "../components/cards/RiskBadge";
import StatusBadge from "../components/cards/StatusBadge";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [data, setData] = useState<DashboardLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    try {
      const d = await api.getDashboardLatest();
      setData(d);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // Initial fetch
  useState(() => { fetch(); });
  useAutoRefresh(fetch, 5000);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Smart Agriculture Landslide Prevention System</p>
        </div>
        <div className={styles.meta}>
          <span className={styles.pulse} />
          <span className={styles.liveLabel}>Live</span>
          {lastUpdated && (
            <span className={styles.timestamp}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!data && !error && <div className={styles.loading}>Loading sensor data…</div>}

      {data && (
        <>
          <section className={styles.metrics}>
            <MetricCard
              title="Water Pressure"
              value={data.sensor.water_pressure.toFixed(1)}
              unit="kPa"
              icon="💧"
            />
            <MetricCard
              title="Tilt Angle"
              value={data.sensor.tilt_angle.toFixed(2)}
              unit="°"
              icon="📐"
            />
            <MetricCard
              title="Soil Moisture"
              value={data.sensor.soil_moisture.toFixed(1)}
              unit="%"
              icon="🌱"
            />
            <MetricCard
              title="Rainfall"
              value={data.sensor.rainfall.toFixed(1)}
              unit="mm/h"
              icon="🌧"
            />
          </section>

          <section className={styles.statusSection}>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Risk Level</span>
              <RiskBadge level={data.sensor.risk_level} />
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Gate Status</span>
              <StatusBadge type="gate" status={data.gate.status} />
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Irrigation</span>
              <StatusBadge type="irrigation" status={data.irrigation.status} />
            </div>
          </section>

          <section className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h2 className={styles.detailTitle}>Latest Reading</h2>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.tableKey}>Timestamp</td>
                    <td>{new Date(data.sensor.timestamp).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Water Pressure</td>
                    <td>{data.sensor.water_pressure.toFixed(2)} kPa</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Tilt Angle</td>
                    <td>{data.sensor.tilt_angle.toFixed(3)}°</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Soil Moisture</td>
                    <td>{data.sensor.soil_moisture.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Rainfall</td>
                    <td>{data.sensor.rainfall.toFixed(2)} mm/h</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Risk Level</td>
                    <td>{data.sensor.risk_level}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.detailCard}>
              <h2 className={styles.detailTitle}>System Status</h2>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td className={styles.tableKey}>Gate</td>
                    <td>
                      <StatusBadge type="gate" status={data.gate.status} />
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Gate Updated</td>
                    <td>{new Date(data.gate.updated_at).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Irrigation</td>
                    <td>
                      <StatusBadge type="irrigation" status={data.irrigation.status} />
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.tableKey}>Irrigation Updated</td>
                    <td>{new Date(data.irrigation.updated_at).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
