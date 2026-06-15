import { useEffect, useMemo, useState } from "react";
import {
  getAllClothes,
  archiveCloth,
  selectActiveClothes,
  filterClothes,
  type Cloth,
  changeClothPrice,
} from "../../features/clothes/clothesSlice";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./ClothesPage.module.scss";
import type { AppDispatch, RootState } from "../../app/store";

import Filters from "../../components/Filters/Filters";
import ClothCard from "../../components/ClothCard/ClothCard";
import BookingModal from "../../components/BookingModal/BookingModal";
import ActionButton from "../../components/ActionButton/ActionButton";
import Loader from "../../components/Loader/Loader";

const ClothesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const clothes = useSelector(selectActiveClothes);
  const loading = useSelector((state: RootState) => state.clothes.loading);

  const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [filterCode, setFilterCode] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterColor, setFilterColor] = useState("");

  const [debouncedCode, setDebouncedCode] = useState("");

  const [colors, setColors] = useState<string[]>([]);

  const currentColors = useMemo(() => {
    return Array.from(new Set(clothes.map((cloth) => cloth.color)));
  }, [clothes]);

  useEffect(() => {
    const hasFilters = debouncedCode || filterDate || filterColor;

    if (!hasFilters) {
      setColors(currentColors);
    }
  }, [currentColors, debouncedCode, filterDate, filterColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(filterCode.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [filterCode]);

  useEffect(() => {
    const hasFilters = debouncedCode || filterDate || filterColor;

    if (hasFilters) {
      dispatch(
        filterClothes({
          code: debouncedCode || undefined,
          date: filterDate || undefined,
          color: filterColor || undefined,
        }),
      );

      return;
    }

    dispatch(getAllClothes());
  }, [dispatch, debouncedCode, filterDate, filterColor]);

  const handleArchive = async (id: number) => {
    try {
      await dispatch(archiveCloth(id)).unwrap();
      toast.success(t("successfullyArchived"));

      const hasFilters = debouncedCode || filterDate || filterColor;

      if (hasFilters) {
        dispatch(
          filterClothes({
            code: debouncedCode || undefined,
            date: filterDate || undefined,
            color: filterColor || undefined,
          }),
        );
      } else {
        dispatch(getAllClothes());
      }
    } catch {
      toast.error(t("somethingWentWrong"));
    }
  };

  const renderMessage = () => {
    const translatedColor = filterColor ? t(`colors.${filterColor}`) : "";

    if (filterCode && filterDate && filterColor) {
      return t("filteredByCodeAndDateAndColor", {
        code: filterCode,
        date: filterDate,
        color: translatedColor,
      });
    }

    if (filterCode && filterDate) {
      return t("filteredByCodeAndDate", {
        code: filterCode,
        date: filterDate,
      });
    }

    if (filterCode && filterColor) {
      return t("filteredByCodeAndColor", {
        code: filterCode,
        color: translatedColor,
      });
    }

    if (filterDate && filterColor) {
      return t("filteredByDateAndColor", {
        date: filterDate,
        color: translatedColor,
      });
    }

    if (filterCode) {
      return t("filteredByCode", { code: filterCode });
    }

    if (filterDate) {
      return t("freeClothesForDate", { date: filterDate });
    }

    if (filterColor) {
      return t("filteredByColor", {
        color: translatedColor,
      });
    }

    return null;
  };

  return (
    <>
      <Filters
        onCodeChange={setFilterCode}
        onDateChange={setFilterDate}
        onColorChange={setFilterColor}
        colors={colors}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          {clothes.length === 0 ? (
            <p style={{ padding: 20, fontSize: 20 }}>{t("notFound")}</p>
          ) : (
            <>
              {renderMessage() && (
                <p style={{ padding: 20, fontSize: 20 }}>{renderMessage()}</p>
              )}

              <div className={styles.wrapper}>
                {clothes.map((cloth: Cloth) => (
                  <ClothCard
                    key={cloth.id}
                    cloth={cloth}
                    onChangePrice={async ({ clothId, price, validFrom }) => {
                      try {
                        await dispatch(
                          changeClothPrice({
                            clothId,
                            price,
                            validFrom,
                          }),
                        ).unwrap();

                        toast.success(t("priceUpdatedSuccessfully"));
                      } catch {
                        toast.error(t("priceUpdateError"));
                      }
                    }}
                  >
                    <ActionButton
                      onClick={() => {
                        setSelectedCloth(cloth);
                        setModalVisible(true);
                      }}
                      variant="primary"
                      text={t("booking")}
                    />

                    <ActionButton
                      onClick={() => handleArchive(cloth.id)}
                      variant="secondary"
                      text={t("archive")}
                    />
                  </ClothCard>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {selectedCloth && (
        <BookingModal
          mode="booking"
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
