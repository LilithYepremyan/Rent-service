import styles from "./Badge.module.scss";

const Badge = ({ count }: { count: number }) => {
  return <div className={styles.badge}>{count}</div>;
};

export default Badge;
