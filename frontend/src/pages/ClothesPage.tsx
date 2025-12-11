import { useEffect, useState } from "react";
import {
  deleteCloth,
  getAllClothes,
  getClothByCode,
  findFreeClothesByDate,
  type Cloth,
} from "../features/clothes/clothesSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import BookingModal from "../components/BookingModal/BookingModal";
import ClothCard from "../components/ClothCard/ClothCard";
import Filters from "../components/Filters/Filters";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ClothesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const clothes = useSelector((state: RootState) => state.clothes.items);

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [filterCode, setFilterCode] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  useEffect(() => {
    applyFilters();
  }, [filterCode, filterDate]);

  const applyFilters = async () => {
    if (!filterCode && !filterDate) {
      dispatch(getAllClothes());
      return;
    }

    if (!filterCode && filterDate) {
      dispatch(findFreeClothesByDate(filterDate));
      return;
    }

    if (filterCode && !filterDate) {
      await dispatch(getClothByCode(filterCode));
      return;
    }

    const free = await dispatch(findFreeClothesByDate(filterDate));
    const byCode = await dispatch(getClothByCode(filterCode));

    if (free.payload && byCode.payload) {
      const cloth = byCode.payload as Cloth;

      const isFree = (free.payload as Cloth[]).some((c) => c.id === cloth.id);

      if (!isFree) {
        dispatch({ type: "clothes/noResults" });
      } else {
        dispatch({ type: "clothes/setItems", payload: [cloth] });
      }
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteCloth(id));
    toast.success(t("successfullyDeleted"));
  };

  return (
    <>
      <Filters
        onCodeChange={setFilterCode}
        onDateChange={setFilterDate}
      />

      {clothes.length === 0 && (
        <p style={{ padding: 20, fontSize: 20 }}>{t("notFound")}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          padding: 20,
        }}
      >
        {clothes.map((cloth) => (
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
      </div>

      <BookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cloth={selectedCloth}
        refreshData={() => dispatch(getAllClothes())}
      />
    </>
  );
};

export default ClothesPage;
