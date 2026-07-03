import styles from "./ProductCard.module.scss";
import type { Rental } from "../../features/rentals/rentalsSlice";
import { useTranslation } from "react-i18next";

type ProductCardProps = {
  rental: Rental;

  onCheck?: (rental: Rental) => void;
  isChecked?: (rental: Rental) => boolean;
  checkBoxLabel?: string;

  showCancelButton?: boolean;
  onCancel?: (rental: Rental) => void;

  showPenaltyButton?: boolean;
  onPenalty?: (rental: Rental) => void;
};

const getPrice = (rental: Rental) => {
  return rental.priceAtRent ?? rental.bookingPrice ?? rental.cloth?.price ?? 0;
};

const ProductCard = ({
  rental,
  onCheck,
  isChecked,
  checkBoxLabel,
  showCancelButton,
  onCancel,
  showPenaltyButton,
  onPenalty,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const price = getPrice(rental);
  const deposit = rental.customer?.deposit || 0;
  const penalty = rental.penalty?.amount || 0;

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {rental.cloth?.photos?.[0] ? (
          <img
            src={rental.cloth.photos[0].url}
            alt={rental.cloth?.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.noImage}>No image</div>
        )}
      </div>

      <div className={styles.content}>
        <div>
          <b>Code:</b> {rental.cloth?.code || "-"}
        </div>

        <div>
          <b>Color:</b>{" "}
          {rental.cloth?.color ? t(`colors.${rental.cloth.color}`) : "-"}
        </div>

        <div>
          <b>Price:</b> {price} AMD
        </div>

        <div>
          <b>Customer:</b>{" "}
          {rental.customer
            ? `${rental.customer.firstName} ${rental.customer.lastName}`
            : "-"}
        </div>

        <div>
          <b>Phone:</b> {rental.customer?.phone || "-"}
        </div>

        <div>
          <b>Deposit:</b> {deposit} AMD
        </div>

        <div>
          <b>Penalty:</b> {penalty} AMD
        </div>

        <div>
          <b>Need to pay:</b> {price - deposit + penalty} AMD
        </div>

        {checkBoxLabel && (
          <div className={styles.checkboxWrapper}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isChecked?.(rental) ?? false}
              onChange={() => onCheck?.(rental)}
              className={styles.done}
            />

            <span className={styles.checkboxText}>
              {isChecked?.(rental) && checkBoxLabel}
            </span>
          </label>
          </div>
        )}

        {showPenaltyButton && (
          <button
            type="button"
            onClick={() => onPenalty?.(rental)}
            className={styles.penaltyBtn}
          >
            {rental.penalty ? t("editPenalty") : t("penalty")}
          </button>
        )}

        {showCancelButton && (
          <button
            type="button"
            onClick={() => onCancel?.(rental)}
            className={styles.cancelBtn}
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
