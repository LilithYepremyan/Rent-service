import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTodayEndingRentals } from "../../features/rentals/rentalsSlice";
import ProductTable from "../../components/ProductTable/ProductTable";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../../app/store";
import { updateClothStatus } from "../../features/clothes/clothesSlice";

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
            dispatch(updateClothStatus({ id: r.id, status: "RETURNED" }))
          }
          isChecked={(r) => r.status === "RETURNED"}
          checkBoxLabel={t("returned")}
        />
      )}
    </>
  );
};

export default ReturnRentals;
