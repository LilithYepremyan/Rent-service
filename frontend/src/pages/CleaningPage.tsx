import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRentals } from "../features/rentals/rentalsSlice";
import { useTranslation } from "react-i18next";
import ProductTable from "../components/ProductTable/ProductTable";
import Badge from "../components/Badge/Badge";
import type { RootState, AppDispatch } from "../app/store";

const CleaningPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);

  const today = new Date().toISOString().split("T")[0];

  const todayCleanings = useMemo(
    () => rentals.filter((r) => r.startDate.split("T")[0] === today),
    [rentals, today]
  );

  const count = todayCleanings.length;
  console.log("count", count);

  useEffect(() => {
    dispatch(getAllRentals());
  }, [dispatch]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
