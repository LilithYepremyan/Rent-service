import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../../app/store";
import ProductTable from "../../components/ProductTable/ProductTable";
import Badge from "../../components/Badge/Badge";
import styles from "./Booking.module.scss";
import {
  getAllRentals,
  updateRentalStatus,
} from "../../features/rentals/rentalsSlice";

export const RentalStatus = {
  RESERVED: "RESERVED",
  CLEANING: "CLEANING",
  RENTED: "RENTED",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED",
} as const;

export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

const Booking: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);

  const today = new Date().toISOString().split("T")[0];

  const todayRentals = rentals.filter(
    (r) => r.rentDate.split("T")[0] === today,
  );

  useEffect(() => {
    // dispatch(getAllClothes());
    dispatch(getAllRentals());
  }, [dispatch]);

  // if (loading) return <p>{t("loading")}</p>;

  return (
    <>
      {todayRentals.length === 0 ? (
        <p>{t("noBookingsForToday")}</p>
      ) : (
        <>
          <div className={styles.wrapper}>
            <h2 className={styles.title}>{t("bookedToday")}</h2>
            <Badge count={todayRentals.length} />
          </div>
          <ProductTable
            products={todayRentals}
            isChecked={(r) => r.status === RentalStatus.RENTED}
            onCheck={(r) =>
              dispatch(
                updateRentalStatus({
                  id: r.id,
                  // status: "RENTED",
                  status:
                    r.status !== RentalStatus.RENTED
                      ? RentalStatus.RENTED
                      : RentalStatus.RESERVED,
                }),
              )
            }
            checkBoxLabel={t("pickedUp")}
          />
        </>
      )}
    </>
  );
};

export default Booking;
