import { useEffect, useState } from "react";
import {
  deleteCloth,
  getAllClothes,
  getClothByCode,
  findFreeClothesByDate,
  type Cloth,
} from "../../features/clothes/clothesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./ClothesPage.module.scss";
import type { AppDispatch, RootState } from "../../app/store";
import Filters from "../../components/Filters/Filters";
import ClothCard from "../../components/ClothCard/ClothCard";
import BookingModal from "../../components/BookingModal/BookingModal";

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
    if (filterCode || filterDate) applyFilters();
  }, [filterCode, filterDate]);

  const applyFilters = async () => {
    if (!filterCode && !filterDate) {
      dispatch(getAllClothes());
      return;
    }

    if (!filterCode && filterDate) {
      const response = await dispatch(findFreeClothesByDate(filterDate));
      if (!response.payload || (response.payload as Cloth[]).length === 0) {
        dispatch({ type: "clothes/noResults" });
      }
      return;
    }

    if (filterCode && !filterDate) {
      const response = await dispatch(getClothByCode(filterCode));
      if (response.meta.requestStatus === "fulfilled" && response.payload) {
        dispatch({ type: "clothes/setItems", payload: [response.payload] });
      } else {
        dispatch({ type: "clothes/noResults" });
      }
      return;
    }

    const freeResponse = await dispatch(findFreeClothesByDate(filterDate));
    const codeResponse = await dispatch(getClothByCode(filterCode));

    if (freeResponse.payload && codeResponse.payload) {
      const cloth = codeResponse.payload as Cloth;
      const isFree = (freeResponse.payload as Cloth[]).some(
        (c) => c.id === cloth.id
      );

      if (isFree) {
        dispatch({ type: "clothes/setItems", payload: [cloth] });
      } else {
        dispatch({ type: "clothes/noResults" });
      }
    } else {
      dispatch({ type: "clothes/noResults" });
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteCloth(id));
    toast.success(t("successfullyDeleted"));
  };

  return (
    <>
      <Filters onCodeChange={setFilterCode} onDateChange={setFilterDate} />

      {clothes.length === 0 && (
        <p style={{ padding: 20, fontSize: 20 }}>{t("notFound")}</p>
      )}

      <div className={styles.wrapper}>
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
