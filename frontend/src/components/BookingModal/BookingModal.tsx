
import Calendar from "react-calendar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./BookingModal.module.scss";
import type { AppDispatch, RootState } from "../../app/store";
import { toast } from "react-toastify";
import {
  getAllRentals,
  type Rental,
} from "../../features/rentals/rentalsSlice";

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
  description: string;
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

const bookCloth = async (
  clothId: number,
  rentDate: string,
  userId: number,
  customer: Customer
) => {
  try {
    const response = await axios.post("http://localhost:5000/rent", {
      clothId,
      rentDate,
      userId,
      customer,
    });
    toast.success("Бронирование успешно!");
    return response.data;
  } catch (error: any) {
    console.error("Ошибка при бронировании:", error);
    toast.error("Ошибка при бронировании. Попробуйте снова.");
    return null;
  }
};

const BookingModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  cloth,
  refreshData,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [deposit, setDeposit] = useState(5000);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (cloth) dispatch(getAllRentals());
  }, [cloth, dispatch]);

  const clothRentals = useMemo(
    () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
    [rentals, cloth]
  );

  console.log("clothRentals:", clothRentals);

  if (!visible || !cloth) return null;

  const getDayStatus = (date: Date) => {
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
  };

  const isBooked = (date: Date) =>
    clothRentals.some((r) => {
      const rentDate = new Date(r.rentDate);
      return (
        rentDate.getUTCFullYear() === date.getFullYear() &&
        rentDate.getUTCMonth() === date.getMonth() &&
        rentDate.getUTCDate() === date.getDate()
      );
    });

  const resetForm = () => {
    setSelectedDate(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setPassport("");
    setDeposit(5000);
    setDescription("");
  };

  const handleConfirm = async () => {
    if (!selectedDate || !firstName || !lastName || !phone || !passport) {
      toast.warn("Заполните все обязательные поля и выберите дату!");
      return;
    }

    console.log("selectedDate:", selectedDate);
    if (isBooked(selectedDate)) {
      toast.error("Эта дата уже забронирована!");
      return;
    }

    if (deposit < 0) {
      toast.warn("Аванс не может быть отрицательным");
      return;
    }

    setLoading(true);

    const formattedDate = toYMD(selectedDate);
    const result = await bookCloth(cloth.id, formattedDate, 1, {
      firstName,
      lastName,
      phone,
      passport,
      deposit,
      description,
    });

    setLoading(false);

    if (result) {
      refreshData();
      resetForm();
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h3 className={styles.modalTitle}>Бронирование: {cloth.name}</h3>

        <div className={styles.calendarContainer}>
          <Calendar
            onChange={(date) => {
              if (!(date instanceof Date)) return;
              if (isBooked(date)) {
                toast.error("Эта дата уже забронирована");
                return;
              }
              setSelectedDate(date);
            }}
            value={selectedDate}
            tileClassName={({ date, view }) =>
              view === "month" ? getDayStatus(date) : ""
            }
            minDate={new Date()}
          />

          <div className={styles.formFields}>
            <label>Имя *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <label>Фамилия *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <label>Телефон *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="[0-9+ ]{7,15}"
              required
            />

            <label>Паспорт *</label>
            <input
              type="text"
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              required
            />

            <label>Аванс</label>
            <input
              type="number"
              value={deposit}
              min={0}
              onChange={(e) => setDeposit(Number(e.target.value))}
            />

            <label>Описание</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={handleConfirm}
              className={`${styles.btn} ${styles.btnConfirm}`}
              disabled={!selectedDate || isBooked(selectedDate) || loading}
            >
              {loading ? "Сохраняем..." : "Подтвердить бронь"}
            </button>

            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className={`${styles.btn} ${styles.btnCancel}`}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
