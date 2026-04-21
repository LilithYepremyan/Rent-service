import { memo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { Cloth } from "../../features/clothes/clothesSlice";
import styles from "./ClothCard.module.scss";

type ClothCardProps = {
  cloth: Cloth;
  children?: ReactNode;
};

const ClothCard = ({ cloth, children }: ClothCardProps) => {
  const { t } = useTranslation();

  const imageUrl = cloth.photos?.[0]?.url;

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
          {t("color")}: {cloth.color}
        </p>

        <p className={styles.info}>
          {t("price")} {cloth.price} AMD
        </p>

        <div className={styles.actions}>{children}</div>
      </div>
    </div>
  );
};

export default memo(ClothCard);
