import { useEffect, useMemo, useState } from "react";
import {
  getAllClothes,
  archiveCloth,
  selectActiveClothes,
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

  const clothes = useSelector(selectActiveClothes);
  const loading = useSelector((state: RootState) => state.clothes.loading);

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [filterCode, setFilterCode] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    dispatch(getAllClothes());
  }, [dispatch]);

  const filteredClothes = useMemo(() => {
    let result = [...clothes];

    if (filterCode.trim()) {
      result = result.filter((cloth) =>
        cloth.code.toLowerCase().includes(filterCode.trim().toLowerCase()),
      );
    }

    if (filterDate) {
      result = result.filter((cloth) => {
        if (!cloth.rentals || cloth.rentals.length === 0) {
          return true;
        }

        return !cloth.rentals.some((rental) => rental.rentDate === filterDate);
      });
    }

    return result;
  }, [clothes, filterCode, filterDate]);

  const handleArchive = async (id: number) => {
    try {
      await dispatch(archiveCloth(id)).unwrap();
      toast.success(t("successfullyArchived"));
      dispatch(getAllClothes());
    } catch {
      toast.error(t("somethingWentWrong"));
    }
  };

  return (
    <>
      <Filters onCodeChange={setFilterCode} onDateChange={setFilterDate} />

      {loading ? (
        <p style={{ padding: 20, fontSize: 20 }}>{t("loading")}</p>
      ) : filteredClothes.length === 0 ? (
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
            t("filteredByCodeAndDate", {
              code: filterCode,
              date: filterDate,
            })}
        </p>
      )}

      <div className={styles.wrapper}>
        {filteredClothes.map((cloth: Cloth) => (
          <ClothCard
            key={cloth.id}
            cloth={cloth}
            onBook={() => {
              setSelectedCloth(cloth);
              setModalVisible(true);
            }}
            onArchive={() => handleArchive(cloth.id)}
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