import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Filters.module.scss";

type Props = {
  onCodeChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

const Filters = ({ onCodeChange, onDateChange }: Props) => {
  const { t } = useTranslation();

  const [code, setCode] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onCodeChange(code);
    }, 500);

    return () => clearTimeout(timeout);
  }, [code, onCodeChange]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onDateChange(date);
    }, 500);

    return () => clearTimeout(timeout);
  }, [date, onDateChange]);

  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder={t("searchByCode")}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className={styles.input}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={styles.input}
      />
    </div>
  );
};

export default Filters;
