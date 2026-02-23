import { useState, useCallback } from "react";
import { api } from "../api";
import type { Alert } from "../types";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import styles from "./Alerts.module.css";

const SEVERITY_CLS: Record<string, string> = {
  HIGH: styles.high,
  MEDIUM: styles.medium,
  LOW: styles.low,
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch = useCallback(async () => {
    try {
      const d = await api.getAlerts();
      setAlerts(d);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useState(() => { fetch(); });
  useAutoRefresh(fetch, 5000);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alerts</h1>
          <p className={styles.subtitle}>All system alerts ordered by latest</p>
        </div>
        {lastUpdated && (
          <span className={styles.timestamp}>
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Message</th>
              <th>Severity</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>No alerts found.</td>
              </tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id}>
                  <td className={styles.id}>{a.id}</td>
                  <td>{a.message}</td>
                  <td>
                    <span className={`${styles.badge} ${SEVERITY_CLS[a.severity] ?? ""}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className={styles.time}>
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
