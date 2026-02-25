import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "./AdminPanel.module.scss";

type FormValues = {
  code: string;
  name: string;
  color: string;
  price: string;
  photos: FileList;
};

type Status = "loading" | "success" | "error" | null;

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch } = useForm<FormValues>();

  const watchedPhotos = watch("photos");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>(null);


  useEffect(() => {
    if (!watchedPhotos?.length) {
      setPreviewUrls([]);
      return;
    }

    const urls = Array.from(watchedPhotos).map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewUrls(urls);

    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, [watchedPhotos]);

  const buildFormData = (data: FormValues) => {
    const formData = new FormData();

    formData.append("code", data.code);
    formData.append("name", data.name);
    formData.append("color", data.color);
    formData.append("price", data.price);

    Array.from(data.photos).forEach((file) => {
      formData.append("photos", file);
    });

    return formData;
  };

  const onSubmit = async (data: FormValues) => {
    setStatus("loading");

    try {
      const formData = buildFormData(data);

      await api.post("/clothes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      reset();
      setPreviewUrls([]);
      navigate("/clothes");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!status) return;

    if (status === "loading") {
      toast.loading(t("adding"), { toastId: "cloth-status" });
      return;
    }

    toast.update("cloth-status", {
      render:
        status === "success"
          ? t("addedSuccessfully")
          : t("addingError"),
      type: status === "success" ? "success" : "error",
      isLoading: false,
      autoClose: status === "success" ? 1500 : 2000,
    });
  }, [status, t]);

  const fields = useMemo(
    () =>
      [
        { name: "code", label: t("code"), type: "text" },
        { name: "name", label: t("name"), type: "text" },
        { name: "color", label: t("color"), type: "text" },
        { name: "price", label: t("price"), type: "number" },
      ] as const,
    [t]
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t("addCloth")}</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
        className={styles.form}
      >
        {fields.map((field) => (
          <div key={field.name} className={styles.field}>
            <label className={styles.label}>
              {field.label} *
            </label>

            <input
              {...register(field.name, { required: true })}
              type={field.type}
              className={styles.input}
            />
          </div>
        ))}

        <label className={styles.fileLabel}>
          {watchedPhotos?.length
            ? `${watchedPhotos.length} ${t("fileSelected")}`
            : t("selectFile")}

          <input
            type="file"
            multiple
            {...register("photos", { required: true })}
            className={styles.fileInput}
          />
        </label>

        <div className={styles.imgWrapper}>
          {previewUrls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`preview-${index}`}
              className={styles.img}
            />
          ))}
        </div>

        <button type="submit" className={styles.button}>
          {t("add")}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
