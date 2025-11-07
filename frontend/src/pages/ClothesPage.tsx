import { useEffect, useState } from "react";
import BookingModal from "../components/BookingModal";
import {
  deleteCloth,
  getAllClothes,
  type Cloth,
} from "../features/clothes/clothesSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import ClothCard from "../components/ClothCard";

const ClothesPage: React.FC = () => {
  const clothes = useSelector((state: RootState) => state.clothes.items);
  const dispatch = useDispatch<AppDispatch>();

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  const handleDelete = async (clothId: number) => {
    if (window.confirm("Удалить этот элемент?")) {
      await dispatch(deleteCloth(clothId));
      alert("✅ Успешно удалено!");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 20,
        padding: 20,
      }}
    >
      {clothes.map((cloth: Cloth) => (
        <ClothCard
          key={cloth.id}
          cloth={cloth}
          onBook={() => {
            setSelectedCloth(cloth);
            setModalVisible(true);
          }}
          onDelete={() => handleDelete(cloth.id)}
        />
      ))}

      <BookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cloth={selectedCloth}
        refreshData={() => dispatch(getAllClothes())}
      />
    </div>
  );
};

export default ClothesPage;
