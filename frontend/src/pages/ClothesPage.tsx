import { useEffect, useState } from "react";
import {
  deleteCloth,
  getAllClothes,
  type Cloth,
} from "../features/clothes/clothesSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import BookingModal from "../components/BookingModal/BookingModal";
import { toast } from "react-toastify";
import ClothCard from "../components/ClothCard/ClothCard";
import { useTranslation } from "react-i18next";

const ClothesPage: React.FC = () => {
  const clothes = useSelector((state: RootState) => state.clothes.items);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  const handleDelete = async (clothId: number) => {
    if (window.confirm(t("deleteItem"))) {
      await dispatch(deleteCloth(clothId));
      toast.success(t("successfullyDeleted"));
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
