import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import styles from "./Filters.module.scss";

type Props = {
  onCodeChange: (value: string) => void;
  onDateChange: (value: string) => void;
};

const Filters = ({ onCodeChange, onDateChange }: Props) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [date, setDate] = useState<Date | null>(null);

  const toYMD = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const timeout = setTimeout(() => onCodeChange(code), 500);
    return () => clearTimeout(timeout);
  }, [code, onCodeChange]);

  useEffect(() => {
    const timeout = setTimeout(() => onDateChange(toYMD(date)), 500);
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
      <DatePicker
        selected={date}
        placeholderText={t("searchByDate")}
        onChange={(newDate: Date | null) => setDate(newDate)}
        dateFormat="dd-MM-yyyy"
        className={styles.input}
      />
    </div>
  );
};


export default Filters;
