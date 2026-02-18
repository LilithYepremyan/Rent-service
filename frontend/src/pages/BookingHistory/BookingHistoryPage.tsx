import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  getRentalsByMonth,
  getRentalsByYear,
} from "../../features/rentals/rentalsSlice";
import type { AppDispatch, RootState } from "../../app/store";
import styles from "./BookingHistoryPage.module.scss";
import { useTranslation } from "react-i18next";
import BookingHistoryList from "../../components/BookingHistoryList/BookingHistoryList";

const RentalsStatsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportRentals = useSelector(
    (state: RootState) => state.rentals.reportRentals,
  );
  // const rentals = useSelector((state: RootState) => state.rentals.rentalsByMonthOrYear);

  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t("bookingHistory")}</h2>

      <div className={styles.filtersContainer}>
        {/* Фильтр по месяцу */}
        <div className={styles.filterCard}>
          <h3 className={styles.filterTitle}>{t("monthlyReport")}</h3>

          <div className={styles.inputGroup}>
            <input
              type="month"
              className={styles.input}
              value={`${year}-${String(month).padStart(2, "0")}`}
              onChange={(e) => {
                const [selectedYear, selectedMonth] = e.target.value.split("-");
                setYear(Number(selectedYear));
                setMonth(Number(selectedMonth));
              }}
            />
          </div>

          <button
            className={styles.button}
            onClick={() => dispatch(getRentalsByMonth({ year, month }))}
          >
            {t("viewReports")}
          </button>
        </div>

        {/* Фильтр по году */}
        <div className={styles.filterCard}>
          <h3 className={styles.filterTitle}>{t("yearlyReport")}</h3>

          <div className={styles.inputGroup}>
            <select
              className={styles.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = currentYear - 4 + i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            className={styles.button}
            onClick={() => dispatch(getRentalsByYear(year))}
          >
            {t("viewReports")}
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsBlock}>
        {t("foundBookings")}: {reportRentals?.length || 0}
      </div>

      {/* Список */}
      <BookingHistoryList products={reportRentals} />
    </div>
  );
};

export default RentalsStatsPage;
