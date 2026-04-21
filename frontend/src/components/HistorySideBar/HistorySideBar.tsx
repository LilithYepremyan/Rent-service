import { useMemo } from "react";
import { FiCalendar } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { LuClipboardList } from "react-icons/lu";
import type { Rental } from "../BookingModal/BookingModal.types";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import type { Cloth } from "../../features/clothes/clothesSlice";
import { useTranslation } from "react-i18next";
import styles from "./HistorySideBar.module.scss";

const HistorySideBar = (cloth: Cloth) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { t } = useTranslation();

  const rentals = useSelector((state: RootState) => state.rentals.rentals);

  const clothRentals = useMemo(
    () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
    [rentals, cloth],
  );

  const futureRentals = clothRentals.filter((rental) => {
    const rentDate = new Date(rental.rentDate);
    return rentDate >= today;
  });

  return (
    <div>
      {futureRentals.length === 0 ? (
        <p>{t("thereAreNoRentals")}</p>
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.nextBooking}>
            <div className={styles.calendarIcon}>
              <FiCalendar color="#0B850B" size={25} />
            </div>
            <div className={styles.info}>
              <p className={styles.title}>{t("nextBooking")}</p>
              <p className={styles.date}>
                {futureRentals[0].rentDate.split("T")[0]}
              </p>
            </div>
          </div>
          <div className={styles.countInfo}>
            <div className={styles.listIcon}>
              <LuClipboardList color="#0B1E9A" size={25} />
            </div>
            <div className={styles.info}>
              <p className={styles.title}>{t("totalUpcomingBookingsCount")}</p>
              <p className={styles.count}> {futureRentals.length}</p>
            </div>
          </div>
          <h3>{t("nearestRentals")}</h3>

          {futureRentals.slice(0, 3).map((r) => (
            <div className={styles.dates}>
              <GoDotFill color="#0B850B" />
              {r.rentDate.split("T")[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorySideBar;
