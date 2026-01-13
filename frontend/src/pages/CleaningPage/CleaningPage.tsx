import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./CleaningPage.module.scss";
import type { AppDispatch } from "../../app/store";
import { getAllRentals } from "../../features/rentals/rentalsSlice";
import Badge from "../../components/Badge/Badge";
import ProductTable from "../../components/ProductTable/ProductTable";

const CleaningPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state) => state.rentals.rentals);

  const today = new Date().toISOString().split("T")[0];

  const todayCleanings = useMemo(
    () => rentals.filter((r) => r.startDate.split("T")[0] === today),
    [rentals, today]
  );

  const count = todayCleanings.length;

  useEffect(() => {
    dispatch(getAllRentals());
  }, [dispatch]);

  return (
    <div>
      <div className={styles.wrapper}>
        <h2>{t("clothesForCleaning")}</h2>
        <Badge count={count} />
      </div>

      {count === 0 ? (
        <p>{t("noClothesForCleaning")}</p>
      ) : (
        <ProductTable products={todayCleanings} />
      )}
    </div>
  );
};

export default CleaningPage;
