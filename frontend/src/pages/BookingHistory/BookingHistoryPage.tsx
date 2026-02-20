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
    (state: RootState) => state.rentals.reportRentals
  );

  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [yearForReport, setYearForReport] = useState(currentYear);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t("bookingHistory")}</h2>

      <div className={styles.filtersContainer}>
        <div className={styles.filterCard}>
          <h3 className={styles.filterTitle}>{t("monthlyReport")}</h3>

          <div className={styles.inputGroup}>
            <input
              type="month"
              className={styles.input}
              value={`${selectedYear}-${String(selectedMonth).padStart(
                2,
                "0"
              )}`}
              onChange={(e) => {
                if (!e.target.value) return;
                const [year, month] = e.target.value.split("-");
                setSelectedYear(Number(year));
                setSelectedMonth(Number(month));
              }}
            />
          </div>

          <button
            className={styles.button}
            onClick={() =>
              dispatch(
                getRentalsByMonth({
                  year: selectedYear,
                  month: selectedMonth,
                })
              )
            }
          >
            {t("viewReports")}
          </button>
        </div>

        <div className={styles.filterCard}>
          <h3 className={styles.filterTitle}>{t("yearlyReport")}</h3>

          <div className={styles.inputGroup}>
            <select
              className={styles.select}
              value={yearForReport}
              onChange={(e) => setYearForReport(Number(e.target.value))}
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
            onClick={() => dispatch(getRentalsByYear(yearForReport))}
          >
            {t("viewReports")}
          </button>
        </div>
      </div>

      <div className={styles.statsBlock}>
        {t("foundBookings")}: {reportRentals?.length ?? 0}
      </div>

      <BookingHistoryList products={reportRentals ?? []} />
    </div>
  );
};

export default RentalsStatsPage;
