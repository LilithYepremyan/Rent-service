import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import styles from "./AdminPanel.module.scss";

interface FormValues {
  code: string;
  name: string;
  color: string;
  price: string;
  photos: FileList;
}

const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch } = useForm<FormValues>();

  const watchedPhotos = watch("photos");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error" | null>(
    null
  );

  useEffect(() => {
    if (!watchedPhotos || watchedPhotos.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const filesArray = Array.from(watchedPhotos);
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [watchedPhotos]);

  const onSubmit = async (data: FormValues) => {
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.append("code", data.code);
      formData.append("name", data.name);
      formData.append("color", data.color);
      formData.append("price", data.price);

      Array.from(data.photos).forEach((file) => {
        formData.append("photos", file);
      });

      await axios.post("http://localhost:5000/clothes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("success");
      reset();
      setPreviewUrls([]);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "loading") {
      toast.loading(t("adding"), { toastId: "cloth-status" });
    } else if (status === "success") {
      toast.update("cloth-status", {
        render: t("addedSuccessfully"),
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } else if (status === "error") {
      toast.update("cloth-status", {
        render: t("addingError"),
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  }, [status, t]);

  const fields: { name: keyof FormValues; label: string; type: string }[] = [
    { name: "code", label: t("code"), type: "text" },
    { name: "name", label: t("name"), type: "text" },
    { name: "color", label: t("color"), type: "text" },
    { name: "price", label: t("price"), type: "number" },
  ];

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t("addCloth")}</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
        className={styles.form}
      >
        {fields.map((field) => (
          <React.Fragment key={field.name}>
            <label className={styles.label}>{field.label} *</label>
            <input
              {...register(field.name, { required: true })}
              name={field.name}
              type={field.type}
              className={styles.input}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />
          </React.Fragment>
        ))}

        <label className={styles.fileLabel}>
          {watchedPhotos && watchedPhotos.length > 0
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
          {previewUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`preview-${i}`}
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
