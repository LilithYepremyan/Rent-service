import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getTodayRentals } from "../features/rentals/rentalsSlice";
import ProductTable from "../components/ProductTable/ProductTable";
import Badge from "../components/Badge/Badge";

const TodayRentals = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const todayRentals = useSelector((state) => state.rentals.rentals);

  console.log("Today's Rentals from Component:", todayRentals);

  useEffect(() => {
    dispatch(getTodayRentals());
  }, [dispatch]);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h2>{t("bookedForToday")}</h2>
        <Badge count={todayRentals.length} />
      </div>
      {todayRentals.length === 0 ? (
        <>
          <p>{t("noBookingsForToday")}</p>
        </>
      ) : (
        <ProductTable products={todayRentals} />
      )}
    </>
  );
};

export default TodayRentals;
