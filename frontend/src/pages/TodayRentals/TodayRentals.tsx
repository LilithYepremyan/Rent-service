import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getTodayRentals } from "../../features/rentals/rentalsSlice";
import Badge from "../../components/Badge/Badge";
import ProductTable from "../../components/ProductTable/ProductTable";
import type { RootState } from "../../app/store";

const TodayRentals = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const todayRentals = useSelector((state: RootState) => state.rentals.rentals);

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
