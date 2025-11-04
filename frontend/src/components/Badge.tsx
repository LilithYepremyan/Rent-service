const Badge = ({ count }: { count: number }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3px",
        height: "20px",
        width: "20px",
        borderRadius: "50%",
        background: "linear-gradient(90deg, #3b82f6, #2563eb)",
      }}
    >
      {count}
    </div>
  );
};

export default Badge;
