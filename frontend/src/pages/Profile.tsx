import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [password, setPassword] = useState("");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  async function save() {
    if (!updateProfile) return;
    await updateProfile({ email, full_name: fullName, password: password || undefined });
    setEditing(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Your account information</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.avatar}>{(user.full_name ?? user.username).charAt(0).toUpperCase()}</div>
          <h2 className={styles.name}>{user.full_name ?? user.username}</h2>
          <p className={styles.role}>System User</p>
          <span className={`${styles.badge} ${user.is_active ? styles.active : styles.inactive}`}>
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className={styles.details}>
          <h3 className={styles.sectionTitle}>Account Details</h3>
          {!editing ? (
            <div>
              <div className={styles.fieldList}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Username</span>
                  <span className={styles.fieldValue}>@{user.username}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.fieldValue}>{user.email}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Full Name</span>
                  <span className={styles.fieldValue}>{user.full_name ?? "—"}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>User ID</span>
                  <span className={styles.fieldValue}>#{user.id}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Member Since</span>
                  <span className={styles.fieldValue}>
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Status</span>
                  <span className={styles.fieldValue}>{user.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.formRow}>
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <label>Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className={styles.formRow}>
                <label>New password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className={styles.actions}>
                <button className={styles.saveBtn} onClick={save}>
                  Save
                </button>
                <button className={styles.cancelBtn} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
