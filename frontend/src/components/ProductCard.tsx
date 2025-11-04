import { useTranslation } from "react-i18next";
import type { Rental } from "../features/rentals/rentalsSlice";

const Item = ({ label, value }: { label: string; value: string | number }) => (
  <p>
    <strong>{label}: </strong> {value || "-"}
  </p>
);

const ProductCard = ({ product }: { product: Rental }) => {
  const { cloth, firstName, lastName, phone } = product;
  const photoUrl = cloth?.photos?.[0]?.url
    ? `http://localhost:5000${cloth.photos[0].url}`
    : "/no-image.png";
  const { t } = useTranslation();
  return (
    <div
      key={product.id}
      style={{
        marginBottom: "20px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "20px",
        border: "1px solid black",
        borderRadius: "10px",
        padding: "10px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {product.cloth?.photos[0] && (
          <img
            src={photoUrl}
            alt={product.cloth.name}
            style={{
              width: "120px",
              height: "170px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        )}
        <div>
          <Item label={t("code")} value={cloth?.name} />
          <Item label={t("color")} value={cloth?.color} />
          <Item label={t("price")} value={cloth?.price} />
          <Item label={t("tenantName")} value={`${firstName} ${lastName}`} />
          <Item label={t("phone")} value={phone} />
        </div>
      </div>
      <div>
        <input type="checkbox" style={{ width: "25px", height: "25px"  , cursor: "pointer", }} />
      </div>
    </div>
  );
};

export default ProductCard;
