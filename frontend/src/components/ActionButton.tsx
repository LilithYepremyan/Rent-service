interface ActionButtonProps {
  onClick: () => void;
  color: "blue" | "red";
  text: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, color, text }) => {
  const gradients = {
    blue: "linear-gradient(90deg, #3b82f6, #2563eb)",
    red: "linear-gradient(90deg, #dc3545, #b02a37)",
  };

  return (
    <button
      onClick={onClick}
      style={{
        background: gradients[color],
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 14px",
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {text}
    </button>
  );
};

export default ActionButton;
