import { memo, type FormEvent, type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdModeEdit } from "react-icons/md";
import type { Cloth } from "../../features/clothes/clothesSlice";
import styles from "./ClothCard.module.scss";

type ClothCardProps = {
  cloth: Cloth;
  children?: ReactNode;
  onChangePrice?: (data: {
    clothId: number;
    price: number;
    validFrom: string;
  }) => void | Promise<void>;
};

const ClothCard = ({ cloth, children, onChangePrice }: ClothCardProps) => {
  const { t } = useTranslation();

  const imageUrl = cloth.photos?.[0]?.url;

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [price, setPrice] = useState(String(cloth.price));

  const handleCancelEdit = () => {
    setPrice(String(cloth.price));
    setIsEditingPrice(false);
  };

  const handleSavePrice = async (e: FormEvent) => {
    e.preventDefault();

    const newPrice = Number(price);

    if (!newPrice || newPrice <= 0) {
      return;
    }

    await onChangePrice?.({
      clothId: cloth.id,
      price: newPrice,
      validFrom: new Date().toISOString().slice(0, 10),
    });

    setIsEditingPrice(false);
  };

  return (
    <div className={styles.container}>
      {imageUrl && (
        <img src={imageUrl} alt={cloth.name} className={styles.photo} />
      )}

      <div>
        <h3 className={styles.info}>{cloth.name}</h3>

        <p className={styles.info}>
          {t("code")}: <b>{cloth.code}</b>
        </p>

        <p className={styles.info}>
          {t("color")}: {cloth.color ? t(`colors.${cloth.color}`) : "-"}
        </p>

        {!isEditingPrice ? (
          <p className={styles.info}>
            {t("price")} {cloth.price} AMD
            <button
              type="button"
              className={styles.editPriceButton}
              onClick={() => setIsEditingPrice(true)}
              aria-label="Edit price"
            >
              <MdModeEdit />
            </button>
          </p>
        ) : (
          <form className={styles.priceEditForm} onSubmit={handleSavePrice}>
            <span>{t("price")}</span>

            <input
              type="number"
              value={price}
              min={1}
              className={styles.priceInput}
              onChange={(e) => setPrice(e.target.value)}
            />

            <span>AMD</span>

            <button type="submit" className={styles.savePriceButton}>
              ✓
            </button>

            <button
              type="button"
              className={styles.cancelPriceButton}
              onClick={handleCancelEdit}
            >
              ✕
            </button>
          </form>
        )}

        <div className={styles.actions}>{children}</div>
      </div>
    </div>
  );
};

export default memo(ClothCard);
