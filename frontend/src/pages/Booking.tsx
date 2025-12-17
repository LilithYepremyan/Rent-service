import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllClothes } from "../features/clothes/clothesSlice";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../app/store";
import ProductTable from "../components/ProductTable/ProductTable";
import Badge from "../components/Badge/Badge";

const Booking: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const rentals = useSelector((state: RootState) => state.rentals.rentals);

  const today = new Date().toISOString().split("T")[0];

  const todayRentals = rentals.filter(
    (r) => r.rentDate.split("T")[0] === today
  );

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  // if (loading) return <p>{t("loading")}</p>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h2>{t("bookedToday")}</h2>
        <Badge count={todayRentals.length} />
      </div>
      {todayRentals.length === 0 ? (
        <p>{t("noBookingsForToday")}</p>
      ) : (
        <ProductTable products={todayRentals} />
      )}
    </>
  );
};

export default Booking;
