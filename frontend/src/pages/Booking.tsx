import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllClothes } from "../features/clothes/clothesSlice";
import type { RootState, AppDispatch } from "../app/store";

const Booking: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.clothes);

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>Бронирование одежды</h2>
      <ul>
        {items.map((cloth) => (
          <li key={cloth.id}>
            {cloth.name} — {cloth.color} — {cloth.price}₽ — {cloth.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Booking;
