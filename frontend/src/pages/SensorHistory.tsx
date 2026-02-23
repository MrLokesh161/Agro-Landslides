import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { api } from "../api";
import type { SensorData } from "../types";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import styles from "./SensorHistory.module.css";

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const CHARTS: {
  key: keyof SensorData;
  label: string;
  color: string;
  unit: string;
}[] = [
  { key: "water_pressure", label: "Water Pressure", color: "#3b82f6", unit: "kPa" },
  { key: "tilt_angle", label: "Tilt Angle", color: "#f59e0b", unit: "°" },
  { key: "soil_moisture", label: "Soil Moisture", color: "#22c55e", unit: "%" },
  { key: "rainfall", label: "Rainfall", color: "#8b5cf6", unit: "mm/h" },
];

export default function SensorHistory() {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    try {
      const d = await api.getSensorHistory(60);
      setHistory([...d].reverse());
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useState(() => { fetch(); });
  useAutoRefresh(fetch, 5000);

  const chartData = history.map((s) => ({
    time: formatTime(s.timestamp),
    water_pressure: +s.water_pressure.toFixed(2),
    tilt_angle: +s.tilt_angle.toFixed(3),
    soil_moisture: +s.soil_moisture.toFixed(2),
    rainfall: +s.rainfall.toFixed(2),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sensor History</h1>
          <p className={styles.subtitle}>Last 60 readings — auto-refreshed every 5 s</p>
        </div>
        {lastUpdated && (
          <span className={styles.timestamp}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!history.length && !error && (
        <div className={styles.loading}>Loading sensor history…</div>
      )}

      <div className={styles.charts}>
        {CHARTS.map(({ key, label, color, unit }) => (
          <div className={styles.chartCard} key={key}>
            <h2 className={styles.chartTitle}>
              {label}
              <span className={styles.chartUnit}>{unit}</span>
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 6, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                  }}
                  formatter={(v) => [`${v ?? "—"} ${unit}`, label]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey={key as string}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
