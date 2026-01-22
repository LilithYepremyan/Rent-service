import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTodayEndingRentals } from "../../features/rentals/rentalsSlice";
import ProductTable from "../../components/ProductTable/ProductTable";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../app/store";

const ReturnRentals = () => {
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const todayEndingRentals = useSelector(
    (state: RootState) => state.rentals.todayEndingRentals
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
        <ProductTable products={todayEndingRentals} />
      )}
    </>
  );
};

export default ReturnRentals;
