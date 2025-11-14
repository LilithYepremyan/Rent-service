import styles from "./ActionButton.module.scss";

interface ActionButtonProps {
  onClick: () => void;
  color: string;
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  color,
  text,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.actionButton} ${styles[color]}`}
      style={{ backgroundColor: color }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {text}
    </button>
  );
};

export default ActionButton;
