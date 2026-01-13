import styles from "./TabButton.module.scss";
const TabButton = ({ value, activeTab, onClick, children }) => {
  const isActive = activeTab === value;

  return (
    <button
      onClick={onClick}
      className={`${styles.tabButton} ${isActive ? styles.active : ""}`}
    >
      {children}
    </button>
  );
};

export default TabButton;
