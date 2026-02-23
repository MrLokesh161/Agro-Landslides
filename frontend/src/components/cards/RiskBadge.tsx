import styles from "./RiskBadge.module.css";

interface Props {
  level: "LOW" | "MEDIUM" | "HIGH";
}

const config = {
  LOW: { label: "LOW RISK", className: "low", dot: "#22c55e" },
  MEDIUM: { label: "MEDIUM RISK", className: "medium", dot: "#f59e0b" },
  HIGH: { label: "HIGH RISK", className: "high", dot: "#ef4444" },
};

export default function RiskBadge({ level }: Props) {
  const { label, className, dot } = config[level];
  return (
    <div className={`${styles.badge} ${styles[className]}`}>
      <span
        className={styles.dot}
        style={{ background: dot }}
      />
      <span>{label}</span>
    </div>
  );
}
