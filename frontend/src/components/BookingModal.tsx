import Calendar from "react-calendar";
import { getAllRentals, type Rental } from "../features/rentals/rentalsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import type { AppDispatch, RootState } from "../app/store";
import axios from "axios";

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

const isSameDate = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// ✅ Функция бронирования вынесена отдельно
const bookCloth = async (
  clothId: number,
  rentDate: string,
  userId: number,
  customer: Customer
) => {
  const formattedDate = rentDate.toString().split("T")[0];

  console.log("Booking date:", formattedDate);
  try {
    const response = await axios.post("http://localhost:5000/rent", {
      clothId,
      rentDate: formattedDate,
      userId,
      customer,
    });
    alert("✅ Бронирование успешно!");
    return response.data;
  } catch (error: any) {
    console.error(error);
    alert(error.response?.data?.message || "Ошибка при бронировани и");
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [deposit, setDeposit] = useState(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (cloth) {
      dispatch(getAllRentals());

      console.log("cloth", cloth.id);
    }
  }, [cloth, dispatch]);

  // фильтруем брони по текущей одежде
  const clothRentals = useMemo(
    () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
    [rentals, cloth]
  );

  if (!visible || !cloth) return null;
  const getDayStatus = (date: Date) => {
    for (const r of clothRentals) {
      const rentDate = new Date(r.rentDate);

      const prevDay = new Date(rentDate);
      prevDay.setDate(rentDate.getDate() - 1);

      const nextDay = new Date(rentDate);
      nextDay.setDate(rentDate.getDate() + 1);

      if (isSameDate(rentDate, date)) {
        return "booked"; // день бронирования
      }

      if (isSameDate(prevDay, date)) {
        return "before-booked"; // день до
      }

      if (isSameDate(nextDay, date)) {
        return "after-booked"; // день после
      }
    }
    return "";
  };

  const isBooked = (date: Date) => {
    return clothRentals.some((r) => {
      const rentDate = new Date(r.rentDate.split("T")[0]);
      return (
        rentDate.getFullYear() === date.getFullYear() &&
        rentDate.getMonth() === date.getMonth() &&
        rentDate.getDate() === date.getDate()
      );
    });
  };

  const handleConfirm = async () => {
    if (!selectedDate || !firstName || !lastName || !phone) {
      return alert("Заполните все поля и выберите дату!");
    }

    const localDate = new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    await bookCloth(cloth.id, localDate, 1, {
      firstName,
      lastName,
      phone,
      passport,
      deposit,
      description,
    });

    refreshData();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 20,
          width: 400,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ textAlign: "center" }}>Бронирование: {cloth.name}</h3>

        <Calendar
          onChange={(date) => {
            if (date instanceof Date && getDayStatus(date) === "booked") {
              alert("❌ Эта дата уже забронирована");
              return;
            }
            setSelectedDate(date as Date);
          }}
          value={selectedDate}
          tileClassName={({ date, view }) => {
            if (view === "month") return getDayStatus(date);
          }}
        />

        <div style={{ marginTop: 10 }}>
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
          <input
            type="text"
            placeholder="Паспортные данные"
            value={passport}
            onChange={(e) => setPassport(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
          <input
            type="number"
            placeholder="Аванс"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 6,
              borderRadius: 5,
            }}
          />
        </div>

        <button
          onClick={handleConfirm}
          style={{
            width: "100%",
            padding: 10,
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            marginTop: 10,
            cursor: "pointer",
          }}
          disabled={!selectedDate || (selectedDate && isBooked(selectedDate))}
        >
          Подтвердить бронь
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 10,
            background: "#ccc",
            color: "#000",
            border: "none",
            borderRadius: 5,
            marginTop: 5,
            cursor: "pointer",
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default BookingModal;
