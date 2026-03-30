import { useEffect, useState } from "react";
import {
  getAllClothes,
  getClothByCode,
  findFreeClothesByDate,
  type Cloth,
  archiveCloth,
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
    applyFilters();
  }, [filterCode, filterDate]);

 const applyFilters = async () => {
  try {
    // 1. Нет фильтров → все вещи
    if (!filterCode && !filterDate) {
      const response = await dispatch(getAllClothes());
      dispatch({
        type: "clothes/setItems",
        payload: response.payload || [],
      });
      return;
    }

    // 2. Только дата
    if (!filterCode && filterDate) {
      const response = await dispatch(findFreeClothesByDate(filterDate));
      dispatch({
        type: "clothes/setItems",
        payload: response.payload || [],
      });
      return;
    }

    // 3. Только код
    if (filterCode && !filterDate) {
      const response = await dispatch(getClothByCode(filterCode));

      if (response.meta.requestStatus === "fulfilled" && response.payload) {
        dispatch({
          type: "clothes/setItems",
          payload: [response.payload],
        });
      } else {
        dispatch({ type: "clothes/noResults" });
      }
      return;
    }

    // 4. Код + дата
    if (filterCode && filterDate) {
      const [freeRes, codeRes] = await Promise.all([
        dispatch(findFreeClothesByDate(filterDate)),
        dispatch(getClothByCode(filterCode)),
      ]);

      if (
        freeRes.payload &&
        codeRes.meta.requestStatus === "fulfilled" &&
        codeRes.payload
      ) {
        const cloth = codeRes.payload as Cloth;

        const isFree = (freeRes.payload as Cloth[]).some(
          (c) => c.id === cloth.id,
        );

        if (isFree) {
          dispatch({
            type: "clothes/setItems",
            payload: [cloth],
          });
        } else {
          dispatch({ type: "clothes/noResults" });
        }
      } else {
        dispatch({ type: "clothes/noResults" });
      }
    }
  } catch (e) {
    dispatch({ type: "clothes/noResults" });
  }
};

  const handleArchive = async (id: number) => {
    await dispatch(archiveCloth(id));
    await dispatch(getAllClothes());
    toast.success(t("successfullyArchived"));
  };

  return (
    <>
      <Filters onCodeChange={setFilterCode} onDateChange={setFilterDate} />

      {clothes.length === 0 ? (
        <p style={{ padding: 20, fontSize: 20 }}>{t("notFound")}</p>
      ) : (
        <p>
          {filterCode &&
            !filterDate &&
            t("filteredByCode", { code: filterCode })}
          {filterDate &&
            !filterCode &&
            t("freeClothesForDate", { date: filterDate })}
          {filterCode &&
            filterDate &&
            t("filteredByCodeAndDate", { code: filterCode, date: filterDate })}
        </p>
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
            onDelete={() => handleArchive(cloth.id)}
          />
        ))}
      </div>

      {selectedCloth && (
        <BookingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          cloth={selectedCloth}
          refreshData={() => dispatch(getAllClothes())}
        />
      )}
    </>
  );
};

export default ClothesPage;
