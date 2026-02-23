import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationToast from "../NotificationToast";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <NotificationToast />
    </div>
  );
}
