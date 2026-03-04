import type { ReactNode } from "react";
import styles from "./TabButton.module.scss";

interface TabButtonProps {
  value: string;
  activeTab: string;
  onClick: () => void;
  children: ReactNode;
}
const TabButton = ({ value, activeTab, onClick, children }: TabButtonProps) => {
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
