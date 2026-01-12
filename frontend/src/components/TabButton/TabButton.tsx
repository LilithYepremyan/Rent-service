import styles from "./TabButton.module.scss";
const TabButton = ({ value, activeTab, onClick, children }) => {
  const isActive = activeTab === value;

  console.log(isActive, "isActive");

  console.log(activeTab, "activeTab");

  console.log(value, "value");

  console.log(onClick, "onClick");

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
