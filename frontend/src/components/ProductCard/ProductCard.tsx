import { useTranslation } from "react-i18next";
import type { Rental } from "../../features/rentals/rentalsSlice";
import styles from "./ProductCard.module.scss";

const Item = ({ label, value }: { label: string; value: string | number }) => (
  <p>
    <strong>{label}: </strong> {value || "-"}
  </p>
);

const ProductCard = ({ product }: { product: Rental }) => {
  const { cloth, customer } = product;

  const photoUrl = cloth?.photos?.[0]?.url
    ? `${import.meta.env.VITE_API_URL}${cloth.photos[0].url}`
    : "/no-image.png";
  const { t } = useTranslation();
  return (
    <div key={product.id} className={styles.container}>
      <div>
        {product.cloth?.photos[0] && (
          <img
            src={photoUrl}
            alt={product.cloth.name}
            className={styles.photo}
          />
        )}
        <div>
          <Item label={t("code")} value={cloth?.name} />
          <Item label={t("color")} value={cloth?.color} />
          <Item label={t("price")} value={cloth?.price} />
          <Item
            label={t("tenantName")}
            value={`${customer.firstName} ${customer.lastName}`}
          />
          <Item label={t("phone")} value={customer.phone} />
        </div>
      </div>
      <div>
        <input type="checkbox" className={styles.checkbox} />
      </div>
    </div>
  );
};

export default ProductCard;
