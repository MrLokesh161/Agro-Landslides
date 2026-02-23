import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password, form.full_name || undefined);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.card}>
        <div className={styles.logo}>🌱</div>
        <h1 className={styles.title}>AgriGuard</h1>
        <p className={styles.subtitle}>Create your account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Username *</label>
              <input
                className={styles.input}
                type="text"
                autoComplete="username"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                type="text"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email *</label>
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password *</label>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
