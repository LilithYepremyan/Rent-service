import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./CleaningPage.module.scss";
import type { AppDispatch, RootState } from "../../app/store";
import {
  getAllRentals,
  updateRentalStatus,
} from "../../features/rentals/rentalsSlice";
import Badge from "../../components/Badge/Badge";
import ProductTable from "../../components/ProductTable/ProductTable";
import { RentalStatus } from "../Booking/Booking";

const CleaningPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);

  const today = new Date().toISOString().split("T")[0];

  const todayCleanings = useMemo(
    () => rentals.filter((r) => r.startDate.split("T")[0] === today),
    [rentals, today],
  );

  const count = todayCleanings.length;

  useEffect(() => {
    dispatch(getAllRentals());
  }, [dispatch]);

  return (
    <>
      <div>
        {count === 0 ? (
          <p>{t("noClothesForCleaning")}</p>
        ) : (
          <>
            <div className={styles.wrapper}>
              <h1 className={styles.title} >{t("cleaningToday")}</h1>
              <Badge count={count} />
            </div>
            <ProductTable
              products={todayCleanings}
              isChecked={(r) => r.status === RentalStatus.CLEANING}
              onCheck={(r) =>
                dispatch(
                  updateRentalStatus({
                    id: r.id,
                    // status: "CLEANING"
                    status:
                      r.status !== RentalStatus.CLEANING
                        ? RentalStatus.CLEANING
                        : RentalStatus.RENTED,
                  }),
                )
              }
              checkBoxLabel={t("sentToCleaning")}
            />
          </>
        )}
      </div>
    </>
  );
};

export default CleaningPage;
