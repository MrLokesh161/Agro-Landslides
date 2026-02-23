import type { GateState, IrrigationState } from "../../types";
import styles from "./StatusBadge.module.css";

interface GateProps {
  type: "gate";
  status: GateState;
}

interface IrrigationProps {
  type: "irrigation";
  status: IrrigationState;
}

type Props = GateProps | IrrigationProps;

const GATE_CONFIG: Record<GateState, { label: string; cls: string }> = {
  OPEN: { label: "Gate OPEN", cls: "on" },
  CLOSED: { label: "Gate CLOSED", cls: "off" },
  EMERGENCY_LOCK: { label: "EMERGENCY LOCK", cls: "emergency" },
};

const IRRIGATION_CONFIG: Record<IrrigationState, { label: string; cls: string }> = {
  ON: { label: "Irrigation ON", cls: "on" },
  OFF: { label: "Irrigation OFF", cls: "off" },
};

export default function StatusBadge(props: Props) {
  const { label, cls } =
    props.type === "gate"
      ? GATE_CONFIG[props.status]
      : IRRIGATION_CONFIG[props.status];

  return (
    <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>
  );
}
