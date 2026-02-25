import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Rental } from "../../features/rentals/rentalsSlice";
import styles from "./BookingHistoryList.module.scss";

type Props = {
  products: Rental[];
};

const ProductTable = ({ products }: Props) => {
  const { t } = useTranslation();

  const totalPaid = useMemo(() => {
    return products.reduce((sum, rental) => {
      const price = rental.cloth?.price ?? 0;
      const deposit = rental.customer?.deposit ?? 0;
      return sum + (price - deposit);
    }, 0);
  }, [products]);

  if (!products.length) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.noImage}>{t("noData")}</div>
      </div>
    );
  }

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
          {products.map((rental) => {
            const cloth = rental.cloth;
            const customer = rental.customer;

            const imageUrl = cloth?.photos?.[0]?.url;
            const fullName = customer
              ? `${customer.firstName} ${customer.lastName}`
              : "-";

            const price = cloth?.price ?? "-";
            const deposit = customer?.deposit ?? 0;
            const paid =
              typeof cloth?.price === "number" ? cloth.price - deposit : "-";

            const rentDate = rental.rentDate?.split("T")[0] ?? "-";

            return (
              <tr key={rental.id}>
                <td>
                  {imageUrl ? (
                    <img
                      className={styles.productImg}
                      src={imageUrl}
                      alt={cloth?.name ?? "product"}
                    />
                  ) : (
                    <div className={styles.noImage}>{t("noImg")}</div>
                  )}
                </td>

                <td>{cloth?.name ?? "-"}</td>
                <td>{cloth?.color ?? "-"}</td>
                <td>{price}</td>
                <td>{fullName}</td>
                <td>{customer?.phone ?? "-"}</td>
                <td>{customer?.passport ?? "-"}</td>
                <td>{customer?.deposit ?? "-"}</td>
                <td>{customer?.description ?? "-"}</td>
                <td>{paid}</td>
                <td>{rentDate}</td>
              </tr>
            );
          })}

          <tr>
            <td className={styles.total} colSpan={2}>
              {t("totalPaid")}: {totalPaid}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
