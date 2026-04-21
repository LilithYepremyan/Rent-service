import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../api/axios";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./BookingForm.module.scss";
import type { Cloth } from "../../features/clothes/clothesSlice";

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
  deposit: yup
    .number()
    .min(0, "depositCannotBeNegative")
    .required("depositRequired"),
  description: yup.string().required("descriptionRequired"),
});

type FormData = yup.InferType<typeof bookingSchema>;

interface BookingFormProps {
  selectedDate: Date | null;
  onClose: () => void;
  refreshData: () => void;
  cloth: Cloth;
  isBooked: (date: Date) => boolean;
  clearSelectedDate: () => void;
}
const BookingForm = ({
  selectedDate,
  onClose,
  refreshData,
  cloth,
  isBooked,
  clearSelectedDate,
}: BookingFormProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      deposit: 5000,
      description: "Check",
    },
  });

  const onSubmit = async (data: FormData) => {
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
      refreshData?.();
      reset();
      clearSelectedDate();
      onClose();
    } catch (error) {
      console.error(t("bookingError"), error);
      toast.error(t("bookingError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formFields}>
      <div>
        <label>{t("firstName")} *</label>
        <input {...register("firstName")} />
        {errors.firstName && (
          <span className={styles.error}>{t(errors.firstName.message!)}</span>
        )}
      </div>

      <div>
        <label>{t("lastName")} *</label>
        <input {...register("lastName")} />
        {errors.lastName && (
          <span className={styles.error}>{t(errors.lastName.message!)}</span>
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
          <span className={styles.error}>{t(errors.passport.message!)}</span>
        )}
      </div>

      <div>
        <label>{t("deposit")}</label>
        <input
          type="number"
          {...register("deposit", { valueAsNumber: true })}
        />
        {errors.deposit && (
          <span className={styles.error}>{t(errors.deposit.message!)}</span>
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
          clearSelectedDate();
          onClose();
        }}
        className={`${styles.btn} ${styles.btnCancel}`}
        disabled={loading}
      >
        {t("cancel")}
      </button>
    </form>
  );
};

export default BookingForm;
