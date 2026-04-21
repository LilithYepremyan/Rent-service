import Calendar from "react-calendar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../app/store";
import {
  getAllRentals,
  type Rental,
} from "../../features/rentals/rentalsSlice";
import type { Cloth } from "../../features/clothes/clothesSlice";
import HistorySideBar from "../HistorySideBar/HistorySideBar";
import BookingForm from "../BookingForm/BookingForm";
import styles from "./BookingModal.module.scss";

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  passport: string;
  deposit: number;
  description: string;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  cloth: Cloth;
  refreshData?: () => void;
  mode: "booking" | "history";
}

const isSameDate = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const BookingModal = ({
  visible,
  onClose,
  cloth,
  refreshData,
  mode,
}: ModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (cloth) {
      dispatch(getAllRentals());
    }
  }, [cloth, dispatch]);

  const clothRentals = useMemo(
    () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
    [rentals, cloth],
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBooked = useCallback(
    (date: Date) =>
      clothRentals.some((r) => {
        const rentDate = new Date(r.rentDate);
        return (
          rentDate.getUTCFullYear() === date.getFullYear() &&
          rentDate.getUTCMonth() === date.getMonth() &&
          rentDate.getUTCDate() === date.getDate()
        );
      }),
    [clothRentals],
  );

  const getDayStatus = useCallback(
    (date: Date) => {
      for (const r of clothRentals) {
        const rentDate = new Date(r.rentDate);

        const prevDay = new Date(rentDate);
        prevDay.setUTCDate(rentDate.getUTCDate() - 1);

        const nextDay = new Date(rentDate);
        nextDay.setUTCDate(rentDate.getUTCDate() + 1);

        if (isSameDate(rentDate, date)) return "booked";
        if (isSameDate(prevDay, date)) return "before-booked";
        if (isSameDate(nextDay, date)) return "after-booked";
      }

      return "";
    },
    [clothRentals],
  );

  if (!visible || !cloth) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modalContainer}>
        <h3 className={styles.modalTitle}>
          {mode === "booking" ? t("booking") : t("historyOfArchivedProduct")} :{" "}
          {cloth.name}
        </h3>

        <div className={styles.calendarContainer}>
          <Calendar
            value={selectedDate}
            minDate={mode === "booking" ? new Date() : undefined}
            onChange={(date) => {
              if (mode === "history") return;
              if (!(date instanceof Date)) return;
              if (isBooked(date)) {
                toast.error(t("dateAlreadyBooked"));
                return;
              }
              setSelectedDate(date);
            }}
            tileClassName={({ date, view }) =>
              view === "month" ? getDayStatus(date) : ""
            }
          />

          {mode === "booking" && (
            <BookingForm
              selectedDate={selectedDate}
              onClose={onClose}
              refreshData={refreshData!}
              cloth={cloth}
              isBooked={isBooked}
              clearSelectedDate={() => setSelectedDate(null)}
            />
          )}
          {mode === "history" && <HistorySideBar {...cloth} />}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
