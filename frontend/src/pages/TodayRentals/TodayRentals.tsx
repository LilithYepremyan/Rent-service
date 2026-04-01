import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getTodayRentals, updateRentalStatus } from "../../features/rentals/rentalsSlice";
import Badge from "../../components/Badge/Badge";
import ProductTable from "../../components/ProductTable/ProductTable";
import type { RootState } from "../../app/store";
import type { AppDispatch } from "../../app/store";

const TodayRentals = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const todayRentals = useSelector(
    (state: RootState) => state.rentals.todayRentals,
  );

  useEffect(() => {
    dispatch(getTodayRentals());
  }, [dispatch]);
  return (
    <>
      {todayRentals.length === 0 ? (
        <>
          <p>{t("noBookingsForToday")}</p>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <h2>{t("bookedForToday")}</h2>
            <Badge count={todayRentals.length} />
          </div>
          <ProductTable
            products={todayRentals}
            isChecked={(r) => r.status === "RENTED"}
            onCheck={(r) => 
              dispatch(
                updateRentalStatus({
                  id: r.id,
                  status: "RENTED",
                }),
              )
            }
            checkBoxLabel={t("done")}
          />
        </>
      )}
    </>
  );
};

export default TodayRentals;
