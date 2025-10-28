import React from "react";
import ActionButton from "./ActionButton";
import type { Cloth } from "../features/clothes/clothesSlice";

interface ClothCardProps {
  cloth: Cloth;
  onBook: () => void;
  onDelete: () => void;
}

const ClothCard: React.FC<ClothCardProps> = ({ cloth, onBook, onDelete }) => {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        textAlign: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transition: "transform 0.3s, box-shadow 0.3s",
        cursor: "pointer",
      }}
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
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            transition: "transform 0.3s",
          }}
        />
      )}

      <div style={{ padding: "15px" }}>
        <h3 style={{ fontSize: "1.1rem", margin: "10px 0", color: "#333" }}>
          {cloth.name}
        </h3>
        <p style={{ margin: "5px 0", color: "#555" }}>
          Код: <b>{cloth.code}</b>
        </p>
        <p style={{ margin: "5px 0", color: "#555" }}>Цвет: {cloth.color}</p>
        <p style={{ margin: "5px 0", fontWeight: 600, color: "#111" }}>
          Цена: {cloth.price} ₽
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "10px",
            flexWrap: "wrap",
          }}
        >
          <ActionButton onClick={onBook} color="blue" text="Забронировать" />
          <ActionButton onClick={onDelete} color="red" text="Удалить" />
        </div>
      </div>
    </div>
  );
};

export default ClothCard;
