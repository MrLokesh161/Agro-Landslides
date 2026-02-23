import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import styles from "./NotificationToast.module.css";

export default function NotificationToast() {
  const [toasts, setToasts] = useState<any[]>([]);
  const timersRef = useRef<Record<number, number>>({});

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const list = await api.getNotifications();
        if (!mounted) return;
        // show only HIGH severity alert notifications as popups; keep other types quiet
        const unread = list.filter((n) => {
          if (n.is_read) return false;
          if (n.type === "alert") return n.severity === "HIGH";
          return true;
        });
        if (unread.length > 0) {
          // show newest unread
          const newest = unread[0];
          setToasts((t) => {
            if (t.find((x) => x.id === newest.id)) return t;
            // schedule auto-dismiss
            if (!timersRef.current[newest.id]) {
              const timer = window.setTimeout(() => {
                markRead(newest.id);
              }, 5000);
              timersRef.current[newest.id] = timer;
            }
            return [newest, ...t].slice(0, 3);
          });
        }
      } catch (e) {
        // ignore
      }
    }
    poll();
    const iv = setInterval(poll, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
      // clear timers
      Object.values(timersRef.current).forEach((id) => clearTimeout(id));
      timersRef.current = {};
    };
  }, []);

  async function markRead(id: number) {
    try {
      await api.markNotificationRead(id);
    } catch (e) {
      // ignore
    } finally {
      // remove toast and clear timer
      setToasts((t) => t.filter((x) => x.id !== id));
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    }
  }

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles.enter}`} onClick={() => markRead(t.id)}>
          <div className={styles.left} />
          <div className={styles.body}>
            <div className={styles.title}>{t.type ?? "Notification"}</div>
            <div className={styles.message}>{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
