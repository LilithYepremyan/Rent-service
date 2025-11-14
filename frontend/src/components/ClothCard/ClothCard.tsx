import React from "react";
import ActionButton from "../ActionButton/ActionButton";
import type { Cloth } from "../../features/clothes/clothesSlice";
import { useTranslation } from "react-i18next";
import styles from "./ClothCard.module.scss";

interface ClothCardProps {
  cloth: Cloth;
  onBook: () => void;
  onDelete: () => void;
}

const ClothCard: React.FC<ClothCardProps> = ({ cloth, onBook, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div
      className={styles.container}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
      }}
    >
      {cloth.photos.length > 0 && (
        <img
          src={`http://localhost:5000${cloth.photos[0].url}`}
          alt={cloth.name}
          className={styles.photo}
        />
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

        <div className={styles.actions}>
          <ActionButton onClick={onBook} color="blue" text="Забронировать" />
          <ActionButton onClick={onDelete} color="red" text="Удалить" />
        </div>
      </div>
    </div>
  );
};

export default ClothCard;
