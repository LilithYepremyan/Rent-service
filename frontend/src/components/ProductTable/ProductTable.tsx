import { useTranslation } from "react-i18next";
import type { Rental } from "../../features/rentals/rentalsSlice";
import styles from "./ProductTable.module.scss";

type ProductTableProps = {
  products: Rental[];
  onCheck?: (rental: Rental) => void;
  isChecked?: (rental: Rental) => boolean;
  checkBoxLabel?: string;
};

const ProductTable = ({
  products,
  onCheck,
  isChecked,
  checkBoxLabel,
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
            <th> {t("done")}</th>
          </tr>
        </thead>

        <tbody>
          {products.map((rental: Rental) => (
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
              <td>{rental.cloth?.color || "-"}</td>
              <td>{`${rental.cloth?.price || "-"} `}</td>
              <td>
                {rental.customer
                  ? `${rental.customer.firstName} ${rental.customer.lastName}`
                  : "-"}
              </td>
              <td>{rental.customer?.phone || "-"}</td>
              <td>{rental.customer?.passport || "-"}</td>
              <td>{rental.customer?.deposit || "-"}</td>
              <td>{rental.customer?.description || "-"}</td>
              <td>{rental.cloth?.price - rental.customer?.deposit}</td>
              <td>
                <label className={styles.checkboxLabel}>
                  <input
                    className={styles.done}
                    type="checkbox"
                    checked={isChecked(rental)}
                    onChange={() => onCheck(rental)}
                  />
                  <span className={styles.checkboxText}>
                    {isChecked(rental) && checkBoxLabel}
                  </span>
                </label>
              </td>
            </tr>
          ))}
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
                  sum + (rental.cloth?.price - (rental.customer?.deposit || 0)),
                0,
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
