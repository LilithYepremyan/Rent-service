import Calendar from "react-calendar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import styles from "./BookingModal.module.scss";
import type { AppDispatch, RootState } from "../../app/store";
import {
  getAllRentals,
  type Rental,
} from "../../features/rentals/rentalsSlice";
import api from "../../api/axios";

interface Photo {
  id: number;
  url: string;
}

interface Cloth {
  id: number;
  code: string;
  name: string;
  color: string;
  price: number;
  status: string;
  photos: Photo[];
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  passport: string;
  deposit: number;
  description?: string;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  cloth: Cloth;
  refreshData: () => void;
}

const isSameDate = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const toYMD = (date: Date | string) => {
  if (typeof date === "string") return date.split("T")[0];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const bookingSchema = yup.object({
  firstName: yup.string().required("firstNameRequired"),
  lastName: yup.string().required("lastNameRequired"),
  phone: yup
    .string()
    .matches(/^(\+374|0)([1-9]\d{7})$/, "invalidPhoneArmenia")
    .required("phoneRequired"),
  passport: yup.string().required("passportRequired"),
  deposit: yup.number().min(0, "depositCannotBeNegative").required(),
  description: yup.string().optional(),
});

const BookingModal = ({ visible, onClose, cloth, refreshData }: ModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);
  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Customer>({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      deposit: 5000,
      description: "Check",
    },
  });

  useEffect(() => {
    if (cloth) {
      dispatch(getAllRentals());
    }
  }, [cloth, dispatch]);

  const clothRentals = useMemo(
    () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
    [rentals, cloth],
  );

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

  const onSubmit = async (data: Customer) => {
    if (!selectedDate) {
      toast.warn(t("selectDate"));
      return;
    }

    if (isBooked(selectedDate)) {
      toast.error(t("dateAlreadyBooked"));
      return;
    }

    setLoading(true);

    try {
      await api.post("/rent", {
        clothId: cloth.id,
        rentDate: toYMD(selectedDate),
        userId: 1,
        customer: data,
      });

      toast.success(t("bookingSuccessful"));
      refreshData();
      reset();
      setSelectedDate(null);
      onClose();
    } catch (error) {
      console.error(t("bookingError"), error);
      toast.error(t("bookingError"));
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !cloth) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h3 className={styles.modalTitle}>
          {t("booking")}: {cloth.name}
        </h3>

        <div className={styles.calendarContainer}>
          <Calendar
            value={selectedDate}
            minDate={new Date()}
            onChange={(date) => {
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

          <form onSubmit={handleSubmit(onSubmit)} className={styles.formFields}>
            <div>
              <label>{t("firstName")} *</label>
              <input {...register("firstName")} />
              {errors.firstName && (
                <span className={styles.error}>
                  {t(errors.firstName.message!)}
                </span>
              )}
            </div>

            <div>
              <label>{t("lastName")} *</label>
              <input {...register("lastName")} />
              {errors.lastName && (
                <span className={styles.error}>
                  {t(errors.lastName.message!)}
                </span>
              )}
            </div>

            <div>
              <label>{t("phone")} *</label>
              <input {...register("phone")} placeholder="098 11 11 11" />
              {errors.phone && (
                <span className={styles.error}>{t(errors.phone.message!)}</span>
              )}
            </div>

            <div>
              <label>{t("passport")} *</label>
              <input {...register("passport")} />
              {errors.passport && (
                <span className={styles.error}>
                  {t(errors.passport.message!)}
                </span>
              )}
            </div>

            <div>
              <label>{t("deposit")}</label>
              <input type="number" {...register("deposit")} />
              {errors.deposit && (
                <span className={styles.error}>
                  {t(errors.deposit.message!)}
                </span>
              )}
            </div>

            <div>
              <label>{t("description")}</label>
              <input {...register("description")} />
            </div>

            <button
              type="submit"
              className={`${styles.btn} ${styles.btnConfirm}`}
              disabled={!selectedDate || loading}
            >
              {loading ? t("save") : t("confirmBooking")}
            </button>

            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedDate(null);
                onClose();
              }}
              className={`${styles.btn} ${styles.btnCancel}`}
              disabled={loading}
            >
              {t("cancel")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
