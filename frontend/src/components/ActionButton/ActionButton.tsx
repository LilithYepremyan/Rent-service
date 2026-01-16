import styles from "./ActionButton.module.scss";

interface ActionButtonProps {
  onClick: () => void;
  variant: "primary" | "secondary" 
  text: string;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  text,
  variant = "primary",
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.actionButton} ${styles[variant]} ${className}`}
    >
      {text}
    </button>
  );
};

export default ActionButton;
