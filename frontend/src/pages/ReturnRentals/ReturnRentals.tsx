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
import styles from "./ReturnRentals.module.scss";
import Badge from "../../components/Badge/Badge";

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
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{t("returnRentals")}</h1>
        <Badge count={todayEndingRentals.length} />
      </div>

      {todayEndingRentals.length === 0 ? (
        <>
          <p>{t("noRentalsEndingToday")}</p>
        </>
      ) : (
        <ProductTable
          products={todayEndingRentals}
          isChecked={(r) => r.status === RentalStatus.RETURNED}
          onCheck={(r) =>
            dispatch(
              updateRentalStatus({
                id: r.id,
                status:
                  r.status !== RentalStatus.RETURNED
                    ? RentalStatus.RETURNED
                    : RentalStatus.RENTED,
              }),
            )
          }
          checkBoxLabel={t("returned")}
        />
      )}
    </>
  );
};

export default ReturnRentals;
