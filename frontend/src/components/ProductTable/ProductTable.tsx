import { useTranslation } from "react-i18next";
import type { Rental } from "../../features/rentals/rentalsSlice";
import styles from "./ProductTable.module.scss";

type ProductTableProps = {
  products: Rental[];
  onCheck?: (rental: Rental) => void;
  isChecked?: (rental: Rental) => boolean;
  checkBoxLabel?: string;
  showCancelButton?: boolean;
  onCancel?: (rental: Rental) => void;
  showPenaltyButton?: boolean;
  onPenalty?: (rental: Rental) => void;
};

const ProductTable = ({
  products,
  onCheck,
  isChecked,
  checkBoxLabel,
  showCancelButton,
  onCancel,
  showPenaltyButton,
  onPenalty,
}: ProductTableProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("image")}</th>
            <th>{t("code")}</th>
            <th>{t("color")}</th>
            <th>{t("price")}</th>
            <th>{t("tenantName")}</th>
            <th>{t("phone")}</th>
            <th>{t("passport")}</th>
            <th>{t("deposit")}</th>
            <th>{t("description")}</th>
            <th>{t("needToPay")}</th>
            {checkBoxLabel && <th>{t("done")}</th>}
            {showCancelButton && <th>{t("cancel")}</th>}
            {showPenaltyButton && <th>{t("penalty")}</th>}
          </tr>
        </thead>

        <tbody>
          {products.map((rental: Rental) => {
            const price = rental.cloth?.price || 0;
            const deposit = rental.customer?.deposit || 0;
            const penalty = rental.penalty?.amount || 0;
            const baseNeedToPay = price - deposit;
            const needToPayWithPenalty = baseNeedToPay + penalty;

            return (
              <tr key={rental.id}>
                <td>
                  {rental.cloth?.photos?.[0] ? (
                    <img
                      className={styles.productImg}
                      src={rental.cloth.photos[0].url}
                      alt={rental.cloth.name}
                    />
                  ) : (
                    <div className={styles.noImage}>{t("noImg")}</div>
                  )}
                </td>
                <td>{rental.cloth?.code || "-"}</td>
                {/* <td>{rental.cloth?.color || "-"}</td>
                 */}
                <td>
                  {rental.cloth?.color
                    ? t(`colors.${rental.cloth.color}`)
                    : "-"}
                </td>
                <td>{price || "-"}</td>
                <td>
                  {rental.customer
                    ? `${rental.customer.firstName} ${rental.customer.lastName}`
                    : "-"}
                </td>
                <td>{rental.customer?.phone || "-"}</td>
                <td>{rental.customer?.passport || "-"}</td>
                <td>{deposit || "-"}</td>
                <td>{rental.customer?.description || "-"}</td>

                <td>
                  {showPenaltyButton && penalty > 0 ? (
                    <div className={styles.penaltyInfo}>
                      {penalty} AMD ({t("penalty")})
                    </div>
                  ) : !showPenaltyButton ? (
                    <strong>{needToPayWithPenalty} AMD</strong>
                  ) : (
                    <div className={styles.needToPay}>
                      <div>{t("noPenalty")}</div>
                    </div>
                  )}
                </td>

                {checkBoxLabel && (
                  <td>
                    <label className={styles.checkboxLabel}>
                      <input
                        className={styles.done}
                        type="checkbox"
                        checked={isChecked?.(rental) ?? false}
                        onChange={() => onCheck?.(rental)}
                      />

                      <span className={styles.checkboxText}>
                        {isChecked?.(rental) && checkBoxLabel}
                      </span>
                    </label>
                  </td>
                )}

                {showPenaltyButton && (
                  <td>
                    <button
                      type="button"
                      onClick={() => onPenalty?.(rental)}
                      className={styles.penaltyBtn}
                    >
                      {rental.penalty ? t("editPenalty") : t("penalty")}
                    </button>
                  </td>
                )}

                {showCancelButton && (
                  <td>
                    <button
                      type="button"
                      onClick={() => onCancel?.(rental)}
                      className={styles.cancelBtn}
                    >
                      {t("cancel")}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
          {showPenaltyButton ? (
            <tr>
              <td colSpan={12} className={styles.total}>
                {t("totalPenalty")}:{" "}
                {products.reduce(
                  (sum, rental) => sum + (rental.penalty?.amount || 0),
                  0,
                )}{" "}
                AMD
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={8} className={styles.total}>
                {t("totalDeposit")}:{" "}
                {products.reduce(
                  (sum, rental) => sum + (rental.customer?.deposit || 0),
                  0,
                )}
              </td>
              <td colSpan={11} className={styles.total}>
                {t("totalNeedToPay")}:{" "}
                {products.reduce(
                  (sum, rental) =>
                    sum +
                    (rental.cloth?.price -
                      (rental.customer?.deposit || 0) +
                      (rental.penalty?.amount || 0)),
                  0,
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
