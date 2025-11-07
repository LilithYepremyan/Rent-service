import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import fs from "fs";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 👇 Чтобы Node понимал, где находимся
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 Папка для фото
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Статика для изображений
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Добавление одежды
app.post("/clothes", upload.array("photos", 5), async (req, res) => {
  try {
    const { code, name, color, price } = req.body;
    const photoUrls =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const cloth = await prisma.cloth.create({
      data: {
        code,
        name,
        color,
        price: parseFloat(price),
        photos: { create: photoUrls.map((url) => ({ url })) },
      },
      include: { photos: true },
    });

    res.json(cloth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при добавлении одежды" });
  }
});

// ✅ Получение всех вещей
app.get("/clothes", async (req, res) => {
  try {
    const clothes = await prisma.cloth.findMany({
      include: { photos: true, rentals: true },
      orderBy: { id: "desc" },
    });
    res.json(clothes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении списка одежды" });
  }
});

// ✅ Поиск одежды по коду
app.get("/clothes/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const cloth = await prisma.cloth.findUnique({
      where: { code },
      include: { photos: true, rentals: true },
    });

    if (!cloth) return res.status(404).json({ message: "Одежда не найдена" });
    res.json(cloth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при поиске одежды" });
  }
});

// ✅ Создание брони
app.post("/rent", async (req, res) => {
  try {
    const { clothId, rentDate, customer } = req.body;
    const { firstName, lastName, phone, passport, deposit, description } =
      customer;
    if (!clothId || !rentDate  || !customer) {
      return res.status(400).json({
        message: "Нужны clothId, rentDate, customer info",
      });
    }

    // Проверка минимальных данных
    if (  !customer) {
      return res.status(400).json({
        message:
          "В customer должны быть userId, firstName, lastName, phone, passport, deposit",
      });
    }

    // Разбираем дату
    const [year, month, day] = rentDate.split("-").map(Number);
    // const rent = new Date(year, month - 1, day);
    const rent = new Date(Date.UTC(year, month - 1, day));

    const startDate = new Date(rent);

    const endDate = new Date(rent);

    startDate.setUTCDate(startDate.getUTCDate() - 1);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const formatLocalDate = (d) => {
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    // Проверка пересечений
    const overlapping = await prisma.rental.findFirst({
      where: {
        clothId,
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });

    if (overlapping)
      return res
        .status(400)
        .json({ message: "Вещь уже забронирована на эти даты" });

    // Создание брони
    const rental = await prisma.rental.create({
      data: {
        clothId,
        rentDate: rent,
        startDate,
        endDate,
        // userId,  
        customer: {
          firstName,
          lastName,
          phone,
          passport,
          deposit,
          description,
        },
      },
    });

    // Обновляем статус вещи
    await prisma.cloth.update({
      where: { id: clothId },
      data: { status: "RESERVED" },
    });

    // Отправляем даты как YYYY-MM-DD, без смещений
    res.json({
      ...rental,
      rentDate: formatLocalDate(rent),
      startDate: formatLocalDate(startDate),
      endDate: formatLocalDate(endDate),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при бронировании" });
  }
});

// ✅ Отмена брони
app.delete("/rent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await prisma.rental.delete({ where: { id: parseInt(id) } });

    const activeRental = await prisma.rental.findFirst({
      where: { clothId: rental.clothId },
    });

    if (!activeRental) {
      await prisma.cloth.update({
        where: { id: rental.clothId },
        data: { status: "AVAILABLE" },
      });
    }

    res.json({ message: "Бронь отменена", rental });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при отмене брони" });
  }
});

// ✅ Получить все брони на дату
// app.get("/rentals", async (req, res) => {
//   const { date } = req.query;
//   const d = new Date(date);

//   const rentals = await prisma.rental.findMany({
//     where: { OR: [{ startDate: { lte: d }, endDate: { gte: d } }] },
//     include: { cloth: true },
//   });

//   res.json(rentals);
// });

// ✅ Удаление одежды
app.delete("/clothes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const clothId = parseInt(id);

    // Проверим, существует ли вещь
    const cloth = await prisma.cloth.findUnique({
      where: { id: clothId },
      include: { photos: true },
    });

    if (!cloth) {
      return res.status(404).json({ message: "Одежда не найдена" });
    }

    // Удаляем фото с диска
    cloth.photos.forEach(async (photo) => {
      const filePath = path.join(__dirname, photo.url);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    });

    // Удаляем все брони, связанные с этой одеждой
    await prisma.rental.deleteMany({
      where: { clothId },
    });

    // Удаляем одежду (вместе с фото из БД)
    await prisma.photo.deleteMany({
      where: { clothId },
    });

    await prisma.cloth.delete({
      where: { id: clothId },
    });

    res.json({ message: "Одежда успешно удалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при удалении одежды" });
  }
});

// ✅ Получить все брони или брони на конкретную дату
app.get("/rentals", async (req, res) => {
  try {
    const { date } = req.query;

    let where = {}; // по умолчанию — без фильтра

    if (date) {
      const d = new Date(date);
      if (isNaN(d)) {
        return res.status(400).json({ message: "Неверный формат даты" });
      }

      // фильтр только по указанной дате
      where = {
        OR: [{ startDate: { lte: d }, endDate: { gte: d } }],
      };
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: { cloth: { include: { photos: true } } },
      orderBy: { id: "desc" },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении броней" });
  }
});

// ✅ Вещи для химчистки (за день до аренды)
app.get("/rentals/cleaning", async (req, res) => {
  const { date } = req.query;
  const d = new Date(date);
  const cleaningDate = new Date(d);
  cleaningDate.setDate(cleaningDate.getDate() + 1);

  const rentals = await prisma.rental.findMany({
    where: { rentDate: cleaningDate },
    include: { cloth: true },
  });

  res.json(rentals);
});

// ✅ Запускаем сервер
app.listen(5000, () => console.log("✅ Server running on port 5000"));
