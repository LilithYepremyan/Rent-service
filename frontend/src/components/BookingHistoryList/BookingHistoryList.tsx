import { useTranslation } from "react-i18next";
import type { Rental } from "../../features/rentals/rentalsSlice";
import styles from "./BookingHistoryList.module.scss";

const ProductTable = ({ products }: { products: Rental[] }) => {
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
            <th>{t("paid")}</th>
            <th>{t("date")}</th>
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
              <td>{rental.cloth?.name || "-"}</td>
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
              <td>{rental.cloth?.price}</td>
              <td>{rental.rentDate.split("T")[0]}</td>
            </tr>
          ))}
          <tr>
            <td></td>
            <td className={styles.total} colSpan={11}>
              {t("totalPaid")}:{" "}
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
