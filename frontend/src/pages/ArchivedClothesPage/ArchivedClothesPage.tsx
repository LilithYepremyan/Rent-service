import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllClothes,
  getArchivedClothes,
  selectArchivedClothes,
  unarchiveCloth,
  type Cloth,
} from "../../features/clothes/clothesSlice";
import type { AppDispatch, RootState } from "../../app/store";
import ClothCard from "../../components/ClothCard/ClothCard";
import { t } from "i18next";
import styles from "./ArchivedClothesPage.module.scss";

const ArchivedClothesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const clothes = useSelector(selectArchivedClothes);
  const loading = useSelector((state: RootState) => state.clothes.loading);

  useEffect(() => {
    dispatch(getArchivedClothes());
  }, [dispatch]);

  const handleUnarchive = async (id: number) => {
    try {
      await dispatch(unarchiveCloth(id)).unwrap();
      toast.success(t("successfullyUnarchived"));
      dispatch(getArchivedClothes());
      dispatch(getAllClothes());
    } catch {
      toast.error(t("errorUnarchiving"));
    }
  };

  if (loading) {
    return <p >{t("loading")}</p>;
  }

  if (clothes.length === 0) {
    return <p>{t("noArchivedClothes")}</p>;
  }

  return (
    <div  className={styles.wrapper} >
      {clothes.map((cloth: Cloth) => (
        <ClothCard
          key={cloth.id}
          cloth={cloth}
          // onViewHistory={() => {}}
          onUnarchive={() => handleUnarchive(cloth.id)}
        />
      ))}
    </div>
  );
};

export default ArchivedClothesPage;
