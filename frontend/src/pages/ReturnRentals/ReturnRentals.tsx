import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTodayEndingRentals,
  updateRentalStatus,
} from "../../features/rentals/rentalsSlice";
import ProductTable from "../../components/ProductTable/ProductTable";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../../app/store";
import { RentalStatus } from "../Booking/Booking";

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
                  r.status !== RentalStatus.RETURNED
                    ? RentalStatus.RENTED
                    : RentalStatus.RETURNED,
              }),
            )
          }
          isChecked={(r) => r.status === RentalStatus.RETURNED}
          checkBoxLabel={t("returned")}
        />
      )}
    </>
  );
};

export default ReturnRentals;
