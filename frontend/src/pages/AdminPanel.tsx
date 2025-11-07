import React, { useCallback, useState } from "react";
import axios from "axios";

const AdminPanel: React.FC = () => {
  const [form, setForm] = useState({
    code: "",
    name: "",
    color: "",
    price: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPhotos(selectedFiles);
      setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      photos.forEach((photo) => formData.append("photos", photo));

      await axios.post("http://localhost:5000/clothes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus("success");
      setTimeout(() => {
        setForm({ code: "", name: "", color: "", price: "" });
        setPhotos([]);
        setPreviewUrls([]);
        setStatus(null);
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [form, photos]);

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "50px auto",
        padding: "30px",
        borderRadius: "20px",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(15px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#2563eb" }}>
        Добавление одежды
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
        encType="multipart/form-data"
      >
        {["code", "name", "color", "price"].map((field) => (
          <input
            key={field}
            name={field}
            type={field === "price" ? "number" : "text"}
            placeholder={
              field === "code"
                ? "Код"
                : field === "name"
                ? "Название"
                : field === "color"
                ? "Цвет"
                : "Цена"
            }
            value={form[field as keyof typeof form]}
            onChange={handleChange}
            required
            style={{
              padding: "10px 15px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              outline: "none",
              fontSize: "0.95rem",
              transition: "all 0.3s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
          />
        ))}

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ padding: "6px", borderRadius: "8px", cursor: "pointer" }}
        />

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {previewUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="preview"
              style={{
                width: 80,
                height: 80,
                objectFit: "cover",
                borderRadius: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "transform 0.3s",
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg, #3b82f6, #2563eb)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          Добавить
        </button>
      </form>

      {status === "loading" && <p style={{ marginTop: 15 }}>Добавление...</p>}
      {status === "success" && (
        <p style={{ marginTop: 15, color: "green" }}>✅ Одежда добавлена!</p>
      )}
      {status === "error" && (
        <p style={{ marginTop: 15, color: "red" }}>❌ Ошибка при добавлении</p>
      )}
    </div>
  );
};

export default AdminPanel;
