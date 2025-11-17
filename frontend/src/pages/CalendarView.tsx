import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTranslation } from "react-i18next";

const CalendarView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t("calendarForBooking")}</h2>
      <Calendar />
      <button style={{ marginTop: "20px" }}>{t("createBooking")}</button>
    </div>
  );
};

export default CalendarView;
