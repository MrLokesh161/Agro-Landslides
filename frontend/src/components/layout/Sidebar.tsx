import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

const links = [
  { to: "/", label: "Dashboard", icon: "⬡", end: true },
  { to: "/alerts", label: "Alerts", icon: "⚠", end: false },
  { to: "/history", label: "Sensor History", icon: "📈", end: false },
  { to: "/sensors", label: "Sensor Connection", icon: "📡", end: false },
  { to: "/scenario", label: "Scenario Control", icon: "🎛", end: false },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🌱</span>
        <span className={styles.brandText}>AgriGuard</span>
      </div>
      <nav className={styles.nav}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.profileRow} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.avatar}>
              {(user.full_name ?? user.username).charAt(0).toUpperCase()}
            </span>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>
                {user.full_name ?? user.username}
              </span>
              <span className={styles.profileEmail}>{user.email}</span>
            </div>
          </NavLink>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

