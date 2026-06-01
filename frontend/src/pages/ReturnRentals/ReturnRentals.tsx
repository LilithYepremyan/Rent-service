import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTodayEndingRentals,
  updateRentalPenalty,
  updateRentalStatus,
  type PenaltyReason,
  type Rental,
} from "../../features/rentals/rentalsSlice";
import ProductTable from "../../components/ProductTable/ProductTable";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "../../app/store";
import { RentalStatus } from "../Booking/Booking";
import styles from "./ReturnRentals.module.scss";
import Badge from "../../components/Badge/Badge";
import PenaltyModal from "../../components/PenaltyModal/PenaltyModal";

const ReturnRentals = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

  const todayEndingRentals = useSelector(
    (state: RootState) => state.rentals.todayEndingRentals,
  );

  useEffect(() => {
    dispatch(getTodayEndingRentals());
  }, [dispatch]);

  const handleOpenPenaltyModal = (rental: Rental) => {
    setSelectedRental(rental);
  };

  const handleClosePenaltyModal = () => {
    setSelectedRental(null);
  };

  const handleSavePenalty = (data: {
    amount: number;
    reason: PenaltyReason;
    description: string;
  }) => {
    if (!selectedRental) return;

    dispatch(updateRentalPenalty({ id: selectedRental.id, ...data }));
    handleClosePenaltyModal();
  };

  return (
    <>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{t("returnRentals")}</h1>
        <Badge count={todayEndingRentals.length} />
      </div>

      {todayEndingRentals.length === 0 ? (
        <p>{t("noRentalsEndingToday")}</p>
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
          showPenaltyButton
          onPenalty={handleOpenPenaltyModal}
        />
      )}

      <PenaltyModal
        open={Boolean(selectedRental)}
        rental={selectedRental}
        onClose={handleClosePenaltyModal}
        onSave={handleSavePenalty}
      />
    </>
  );
};

export default ReturnRentals;
