import styles from "./MetricCard.module.css";

interface Props {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
}

export default function MetricCard({ title, value, unit, icon }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
}
