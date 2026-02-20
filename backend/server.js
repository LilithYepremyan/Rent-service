import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import upload from "./middleware/upload.js";
import fs from "fs";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 👇 Чтобы Node понимал, где находимся
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("👋 Welcome to the Rent Service API");
  console.log("👋 Welcome to the Rent Service API");
});

// ✅ Добавление одежды
app.post("/clothes", upload.array("photos", 5), async (req, res) => {
  try {
    const { code, name, color, price } = req.body;
    const photoUrls = req.files?.map((file) => file.path) || [];

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

//Поиск свободной одежды на дату
app.get("/clothes/free/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const d = new Date(date);
    if (isNaN(d)) {
      return res.status(400).json({ message: "Неверный формат даты" });
    }

    const freeClothes = await prisma.cloth.findMany({
      where: {
        rentals: {
          none: {
            startDate: { lte: d },
            endDate: { gte: d },
          },
        },
      },
      include: { photos: true, rentals: true },
    });

    res.json(freeClothes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при поиске свободной одежды" });
  }
});

// ✅ Создание брони
app.post("/rent", async (req, res) => {
  try {
    const { clothId, rentDate, customer } = req.body;
    const { firstName, lastName, phone, passport, deposit, description } =
      customer;
    if (!clothId || !rentDate || !customer?.firstName) {
      return res.status(400).json({
        message: "Нужны clothId, rentDate, customer info",
      });
    }

    // Проверка минимальных данных
    if (!customer) {
      return res.status(400).json({
        message:
          "В customer должны быть userId, firstName, lastName, phone, passport, deposit",
      });
    }

    // Разбираем дату
    const [year, month, day] = rentDate.split("-").map(Number);
    const rent = new Date(Date.UTC(year, month - 1, day));

    const startDate = new Date(rent);

    const endDate = new Date(rent);

    startDate.setUTCDate(startDate.getUTCDate() - 1);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const formatYMD = (date) => {
      const d = new Date(date); // date из Prisma (UTC)
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
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

      rentDate: formatYMD(rent),
      startDate: formatYMD(startDate),
      endDate: formatYMD(endDate),
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

// ✅ Брони в выбранную дату
app.get("/rentals/forSelectedDate", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date обязателен" });
    }

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: d,
          lt: next,
        },
      },
      include: {
        cloth: { include: { photos: true } },
      },
      orderBy: { rentDate: "asc" },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении бронирований" });
  }
});

// ✅ Вещи для химчистки (за день до аренды)
app.get("/rentals/cleaning", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date обязателен" });
    }

    // День химчистки
    const cleaningDay = new Date(date);
    cleaningDay.setHours(0, 0, 0, 0);

    // День аренды = следующий день
    const rentStart = new Date(cleaningDay);
    rentStart.setDate(rentStart.getDate() + 1);

    const rentEnd = new Date(rentStart);
    rentEnd.setDate(rentEnd.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: rentStart,
          lt: rentEnd,
        },
      },
      include: {
        cloth: {
          include: { photos: true },
        },
      },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ✅ Брони, созданные сегодня
app.get("/rentals/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // начало дня
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // начало следующего дня

    // Находим брони, которые созданы сегодня
    // и при этом аренда ещё впереди (rentDate >= сегодня)
    const rentals = await prisma.rental.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        rentDate: { gte: today },
      },
      include: { cloth: { include: { photos: true } } },
    });

    const totalDeposit = rentals.reduce(
      (sum, r) => sum + (r.customer.deposit || 0),
      0,
    );

    res.json({ rentals, totalDeposit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении броней за сегодня" });
  }
});

// ✅ Вещи, у которых аренда заканчивается сегодня
app.get("/rentals/ends-today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        endDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        cloth: {
          include: { photos: true },
        },
      },
      orderBy: { endDate: "asc" },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при получении аренд с окончанием сегодня",
    });
  }
});

app.get("/rentals/ends", async (req, res) => {
  try {
    const { date } = req.query;

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        endDate: {
          gte: d,
          lt: next,
        },
      },
      include: { cloth: { include: { photos: true } } },
    });

    res.json(rentals);
  } catch (e) {
    res.status(500).json({ message: "Ошибка" });
  }
});

// Получить все брони за конкретный месяц
// Получить все брони за месяц
app.get("/rentals/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;

    const yearNum = Number(year);
    const monthNum = Number(month);

    // Проверка корректности
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Неверный год или месяц" });
    }

    const start = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const end = new Date(Date.UTC(yearNum, monthNum, 1)); // первый день следующего месяца

    console.log("Fetching rentals from", start, "to", end);

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: start,
          lt: end,
        },
      },
      include: { cloth: { include: { photos: true } } },
      orderBy: { rentDate: "asc" },
    });

    res.json(rentals);
  } catch (error) {
    console.error("Ошибка в /rentals/month/:year/:month:", error);
    res.status(500).json({ message: error.message });
  }
});

// Получить все брони за конкретный год
app.get("/rentals/year/:year", async (req, res) => {
  try {
    const { year } = req.params;

    const start = new Date(Number(year), 0, 1); // 1 января
    const end = new Date(Number(year) + 1, 0, 1); // 1 января следующего года

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: start,
          lt: end,
        },
      },
      include: { cloth: { include: { photos: true } } },
      orderBy: { rentDate: "asc" },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении броней за год" });
  }
});

// ✅ Запускаем сервер
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
