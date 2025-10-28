import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarView: React.FC = () => {
  return (
    <div>
      <h2>Календарь бронирований</h2>
      <Calendar />
      <button style={{ marginTop: "20px" }}>Создать бронирование</button>
    </div>
  );
};

export default CalendarView;
