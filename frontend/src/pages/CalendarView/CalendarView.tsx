import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import styles from "./CalendarView.module.scss";
import {
  getCleaningRentalsByDate,
  getEndingRentalsByDate,
  getRentalsByDate,
} from "../../features/rentals/rentalsSlice";
import TabButton from "../../components/TabButton/TabButton";
import ProductTable from "../../components/ProductTable/ProductTable";

const CalendarView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<
    "booking" | "cleaning" | "return"
  >("booking");
  const [selectedDate, setSelectedDate] = React.useState<string>("");

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const rentalsByDate = useSelector(
    (state: any) => state.rentals.rentalsByDate
  );
  const cleaningsRentalsByDate = useSelector(
    (state: any) => state.rentals.cleaningsRentalsByDate
  );
  const endingRentalsByDate = useSelector(
    (state: any) => state.rentals.endingRentalsByDate
  );

  const handleDayClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];

    dispatch(getRentalsByDate(dateString));
    dispatch(getCleaningRentalsByDate(dateString));
    dispatch(getEndingRentalsByDate(dateString));

    setSelectedDate(dateString);
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{t("ordersAndReturnsStatus")}</h2>
      {selectedDate && (
        <p className={styles.subtitle}>
          {t("youSelectedDate")}: <strong>{selectedDate}</strong>
        </p>
      )}

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.calendarWrapper}>
            <Calendar onClickDay={handleDayClick} />
          </div>

          <div className={styles.tabs}>
            <TabButton
              value="booking"
              activeTab={activeTab}
              onClick={() => setActiveTab("booking")}
            >
              Booking ({rentalsByDate.length})
            </TabButton>

            <TabButton
              value="cleaning"
              activeTab={activeTab}
              onClick={() => setActiveTab("cleaning")}
            >
              Cleaning ({cleaningsRentalsByDate.length})
            </TabButton>

            <TabButton
              value="return"
              activeTab={activeTab}
              onClick={() => setActiveTab("return")}
            >
              Return ({endingRentalsByDate.length})
            </TabButton>
          </div>
        </aside>

        <section className={styles.content}>
          {activeTab === "booking" &&
            (rentalsByDate.length ? (
              <ProductTable products={rentalsByDate} />
            ) : (
              t("noBookingsForSelectedDate")
            ))}

          {activeTab === "cleaning" &&
            (cleaningsRentalsByDate.length ? (
              <ProductTable products={cleaningsRentalsByDate} />
            ) : (
              t("noCleaningsForSelectedDate")
            ))}

          {activeTab === "return" &&
            (endingRentalsByDate.length ? (
              <ProductTable products={endingRentalsByDate} />
            ) : (
              t("noReturnsForSelectedDate")
            ))}
        </section>
      </div>
    </div>
  );
};

export default CalendarView;
