// import Calendar from "react-calendar";
// import { getAllRentals, type Rental } from "../features/rentals/rentalsSlice";
// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useMemo, useState } from "react";
// import type { AppDispatch, RootState } from "../app/store";
// import axios from "axios";
// import styles from "./BookingModal.module.scss";

// interface Photo {
//   id: number;
//   url: string;
// }

// interface Cloth {
//   id: number;
//   code: string;
//   name: string;
//   color: string;
//   price: number;
//   status: string;
//   photos: Photo[];
// }

// export interface Customer {
//   firstName: string;
//   lastName: string;
//   phone: string;
//   passport: string;
//   deposit: number;
//   description: string;
// }

// interface ModalProps {
//   visible: boolean;
//   onClose: () => void;
//   cloth: Cloth;
//   refreshData: () => void;
// }

// const isSameDate = (date1: Date, date2: Date) =>
//   date1.getFullYear() === date2.getFullYear() &&
//   date1.getMonth() === date2.getMonth() &&
//   date1.getDate() === date2.getDate();

// const bookCloth = async (
//   clothId: number,
//   rentDate: string,
//   userId: number,
//   customer: Customer
// ) => {
//   const formattedDate = rentDate.toString().split("T")[0];
//   try {
//     const response = await axios.post("http://localhost:5000/rent", {
//       clothId,
//       rentDate: formattedDate,
//       userId,
//       customer,
//     });
//     alert("✅ Бронирование успешно!");
//     return response.data;
//   } catch (error: any) {
//     console.error(error);
//     alert(error.response?.data?.message || "Ошибка при бронировании");
//   }
// };

// const BookingModal: React.FC<ModalProps> = ({
//   visible,
//   onClose,
//   cloth,
//   refreshData,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const rentals = useSelector((state: RootState) => state.rentals.rentals);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [passport, setPassport] = useState("");
//   const [deposit, setDeposit] = useState(0);
//   const [description, setDescription] = useState("");

//   useEffect(() => {
//     if (cloth) dispatch(getAllRentals());
//   }, [cloth, dispatch]);

//   const clothRentals = useMemo(
//     () => rentals.filter((r: Rental) => r.clothId === cloth?.id),
//     [rentals, cloth]
//   );

//   if (!visible || !cloth) return null;

//   const getDayStatus = (date: Date) => {
//     for (const r of clothRentals) {
//       const rentDate = new Date(r.rentDate);
//       const prevDay = new Date(rentDate);
//       prevDay.setDate(rentDate.getDate() - 1);
//       const nextDay = new Date(rentDate);
//       nextDay.setDate(rentDate.getDate() + 1);

//       if (isSameDate(rentDate, date)) return "booked";
//       if (isSameDate(prevDay, date)) return "before-booked";
//       if (isSameDate(nextDay, date)) return "after-booked";
//     }
//     return "";
//   };

//   const isBooked = (date: Date) =>
//     clothRentals.some((r) => {
//       const rentDate = new Date(r.rentDate.split("T")[0]);
//       return isSameDate(rentDate, date);
//     });

//   const handleConfirm = async () => {
//     if (!selectedDate || !firstName || !lastName || !phone) {
//       return alert("Заполните все поля и выберите дату!");
//     }

//     const localDate = new Date(
//       selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
//     )
//       .toISOString()
//       .split("T")[0];

//     await bookCloth(cloth.id, localDate, 1, {
//       firstName,
//       lastName,
//       phone,
//       passport,
//       deposit,
//       description,
//     });

//     refreshData();
//     onClose();
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContainer}>
//         <h3 className={styles.modalTitle}>Бронирование: {cloth.name}</h3>

//         <Calendar
//           onChange={(date) => {
//             if (date instanceof Date && getDayStatus(date) === "booked") {
//               alert("❌ Эта дата уже забронирована");
//               return;
//             }
//             setSelectedDate(date as Date);
//           }}
//           value={selectedDate}
//           tileClassName={({ date, view }) =>
//             view === "month" ? getDayStatus(date) : ""
//           }
//         />

//         <div className={styles.formFields}>
//           <input
//             type="text"
//             placeholder="Имя"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Фамилия"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//           />
//           <input
//             type="tel"
//             placeholder="Телефон"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Паспортные данные"
//             value={passport}
//             onChange={(e) => setPassport(e.target.value)}
//           />
//           <input
//             type="number"
//             placeholder="Аванс"
//             value={deposit}
//             onChange={(e) => setDeposit(Number(e.target.value))}
//           />
//           <input
//             type="text"
//             placeholder="Описание"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//           />
//         </div>

//         <button
//           onClick={handleConfirm}
//           className={`${styles.btn} ${styles.btnConfirm}`}
//           disabled={!selectedDate || isBooked(selectedDate)}
//         >
//           Подтвердить бронь
//         </button>

//         <button
//           onClick={onClose}
//           className={`${styles.btn} ${styles.btnCancel}`}
//         >
//           Отмена
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BookingModal;
