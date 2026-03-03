import styles from "./ActionButton.module.scss";

type ActionButtonProps = {
  onClick: () => void;
  variant?: "primary" | "secondary";
  text: string;
  className?: string;
};

const ActionButton = ({
  onClick,
  text,
  variant = "primary",
  className = "",
}: ActionButtonProps) => {
  const buttonClassName = [
    styles.actionButton,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClassName}
    >
      {text}
    </button>
  );
};

export default ActionButton;
