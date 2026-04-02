import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTodayEndingRentals,
  updateRentalStatus,
} from "../../features/rentals/rentalsSlice";
import ProductTable from "../../components/ProductTable/ProductTable";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../../app/store";

export const ClothStatus = {
  RESERVED: "RESERVED",
  RENTED: "RENTED",
  CLEANING: "CLEANING",
  RETURNED: "RETURNED",
  CANCELED: "CANCELED",
} as const;

export type ClothStatusType = (typeof ClothStatus)[keyof typeof ClothStatus];

const ReturnRentals = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { t } = useTranslation();
  const todayEndingRentals = useSelector(
    (state: RootState) => state.rentals.todayEndingRentals,
  );

  useEffect(() => {
    dispatch(getTodayEndingRentals());
  }, [dispatch]);
  return (
    <>
      {todayEndingRentals.length === 0 ? (
        <>
          <p>{t("noRentalsEndingToday")}</p>
        </>
      ) : (
        <ProductTable
          products={todayEndingRentals}
          onCheck={(r) =>
            dispatch(
              updateRentalStatus({
                id: r.id,
                status:
                  r.status === ClothStatus.RENTED
                    ? ClothStatus.RETURNED
                    : ClothStatus.RENTED,
              }),
            )
          }
          isChecked={(r) => r.status === ClothStatus.RETURNED}
          checkBoxLabel={t("returned")}
        />
      )}
    </>
  );
};

export default ReturnRentals;
