import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import upload from "./middleware/upload.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// 👇 Чтобы Node понимал, где находимся
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getClothStatusByRentalStatus = (rentalStatus) => {
  switch (rentalStatus) {
    case "RESERVED":
      return "RESERVED";

    case "CLEANING":
      return "CLEANING";

    case "RENTED":
      return "RENTED";

    case "RETURNED":
      return "AVAILABLE";

    case "CANCELLED":
      return "AVAILABLE";

    default:
      return null;
  }
};

const getRentalPriceByHistory = (rental) => {
  if (rental.priceAtRent !== null && rental.priceAtRent !== undefined) {
    return rental.priceAtRent;
  }

  const rentTime = new Date(rental.rentDate).getTime();

  const historyItem = rental.cloth?.priceHistory?.find((item) => {
    const from = new Date(item.validFrom).getTime();
    const to = item.validTo ? new Date(item.validTo).getTime() : Infinity;

    return rentTime >= from && rentTime < to;
  });

  return historyItem?.price ?? rental.cloth?.price ?? 0;
};

const addBookingPrice = (rental) => ({
  ...rental,
  bookingPrice: getRentalPriceByHistory(rental),
});

const addBookingPriceToList = (rentals) => rentals.map(addBookingPrice);

app.get("/", (req, res) => {
  res.send("👋 Welcome to the Rent Service API");
  console.log("👋 Welcome to the Rent Service API");
});

// ✅ Добавление одежды
app.post("/clothes", upload.array("photos", 5), async (req, res) => {
  try {
    const { code, name, color, price } = req.body;
    const photoUrls = req.files?.map((file) => file.path) || [];
    const clothPrice = parseFloat(price);

    const cloth = await prisma.cloth.create({
      data: {
        code,
        name,
        color,
        price: clothPrice,
        photos: { create: photoUrls.map((url) => ({ url })) },
        priceHistory: {
          create: { price: clothPrice, validFrom: new Date(), validTo: null },
        },
      },
      include: { photos: true, priceHistory: true },
    });

    res.json(cloth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при добавлении одежды" });
  }
});

//  Получение архива
app.get("/clothes/archived", async (req, res) => {
  try {
    const clothes = await prisma.cloth.findMany({
      where: {
        status: "ARCHIVED",
      },
      include: { photos: true, rentals: true },
      orderBy: { id: "desc" },
    });

    res.json(clothes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении архива" });
  }
});

// ✅ Получение всех вещей
app.get("/clothes", async (req, res) => {
  try {
    const clothes = await prisma.cloth.findMany({
      where: {
        status: {
          not: "ARCHIVED",
        },
      },

      include: {
        photos: true,
        rentals: { where: { status: { not: "CANCELLED" } } },
        priceHistory: { orderBy: { validFrom: "desc" } },
      },
      orderBy: { id: "desc" },
    });
    res.json(clothes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении списка одежды" });
  }
});

// ✅ Поиск одежды с фильтрами (код, цвет, дата)
app.get("/clothes/search/", async (req, res) => {
  try {
    const { code, date, color } = req.query;

    const where = {
      status: {
        not: "ARCHIVED",
      },
    };

    if (code) {
      where.code = String(code);
    }

    if (color) {
      where.color = String(color);
    }

    if (date) {
      const d = new Date(String(date));

      if (isNaN(d)) {
        return res.status(400).json({ message: "Неверный формат даты" });
      }

      where.rentals = {
        none: {
          status: {
            not: "CANCELLED",
          },
          startDate: { lte: d },
          endDate: { gte: d },
        },
      };
    }

    const clothes = await prisma.cloth.findMany({
      where,
      include: { photos: true, rentals: true },
      orderBy: { id: "desc" },
    });

    res.json(clothes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при фильтрации одежды" });
  }
});

// ✅ Поиск одежды по коду
app.get("/clothes/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const cloth = await prisma.cloth.findFirst({
      where: { code, status: { not: "ARCHIVED" } },
      include: {
        photos: true,
        rentals: { where: { status: { not: "CANCELLED" } } },
        priceHistory: { orderBy: { validFrom: "desc" } },
      },
    });

    if (cloth?.status === "ARCHIVED") {
      return res
        .status(404)
        .json({ message: "Нельзя забронировать архивную вещь" });
    }

    if (!cloth) return res.status(404).json({ message: "Одежда не найдена" });
    res.json(cloth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при поиске одежды" });
  }
});

//Поиск одежды по цвету
app.get("/clothes/color/:color", async (req, res) => {
  try {
    const { color } = req.params; // Получаем параметр color из запроса
    const clothes = await prisma.cloth.findMany({
      where: {
        color,
        status: { not: "ARCHIVED" },
      },
      include: { photos: true, rentals: true ,priceHistory: { orderBy: { validFrom: "desc" } }},
      orderBy: { id: "desc" },
    });
    res.json(clothes); // Отправляем массив одежды в ответ
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при поиске одежды по цвету" });
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
        status: {
          not: "ARCHIVED",
        },
        rentals: {
          none: {
            status: {
              not: "CANCELLED",
            },
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

    if (!clothId) {
      return res.status(400).json({
        message: "clothId обязателен",
      });
    }

    if (!rentDate) {
      return res.status(400).json({
        message: "rentDate обязателен",
      });
    }

    if (!customer) {
      return res.status(400).json({
        message:
          "В customer должны быть firstName, lastName, phone, passport, deposit",
      });
    }

    const { firstName, lastName, phone, passport, deposit, description } =
      customer;

    if (!firstName || !lastName || !phone || !passport) {
      return res.status(400).json({
        message: "Заполните обязательные данные клиента",
      });
    }

    const clothIdNumber = Number(clothId);

    if (!clothIdNumber) {
      return res.status(400).json({
        message: "Неверный clothId",
      });
    }

    const cloth = await prisma.cloth.findUnique({
      where: {
        id: clothIdNumber,
      },
    });

    if (!cloth) {
      return res.status(404).json({
        message: "Одежда не найдена",
      });
    }

    if (cloth.status === "ARCHIVED") {
      return res.status(400).json({
        message: "Нельзя забронировать архивную вещь",
      });
    }

    const [year, month, day] = rentDate.split("-").map(Number);
    const rent = new Date(Date.UTC(year, month - 1, day));

    if (isNaN(rent.getTime())) {
      return res.status(400).json({
        message: "Неверный формат даты",
      });
    }

    const startDate = new Date(rent);
    const endDate = new Date(rent);

    startDate.setUTCDate(startDate.getUTCDate() - 1);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const formatYMD = (date) => {
      const d = new Date(date);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const overlapping = await prisma.rental.findFirst({
      where: {
        clothId: clothIdNumber,
        status: {
          not: "CANCELLED",
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({
        message: "Вещь уже забронирована на эти даты",
      });
    }

    let existingCustomer = await prisma.customer.findUnique({
      where: {
        passport,
      },
    });

    if (!existingCustomer) {
      existingCustomer = await prisma.customer.create({
        data: {
          firstName,
          lastName,
          phone,
          passport,
          deposit: Number(deposit) || 0,
          description,
        },
      });
    } else {
      existingCustomer = await prisma.customer.update({
        where: {
          id: existingCustomer.id,
        },
        data: {
          firstName,
          lastName,
          phone,
          deposit: Number(deposit) || 0,
          description,
        },
      });
    }

    const rental = await prisma.$transaction(async (tx) => {
      const createdRental = await tx.rental.create({
        data: {
          clothId: clothIdNumber,
          rentDate: rent,
          startDate,
          endDate,
          customerId: existingCustomer.id,
          status: "RESERVED",

          // самая важная строка
          priceAtRent: cloth.price,
        },
        include: {
          cloth: {
            include: {
              photos: true,
            },
          },
          customer: true,
        },
      });

      await tx.cloth.update({
        where: {
          id: clothIdNumber,
        },
        data: {
          status: "RESERVED",
        },
      });

      return createdRental;
    });

    res.json({
      ...addBookingPrice(rental),
      rentDate: formatYMD(rent),
      startDate: formatYMD(startDate),
      endDate: formatYMD(endDate),
    });
  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Ошибка при бронировании",
      error: error.message,
    });
  }
});
// Обновление статуса одежды
app.patch("/clothes/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Статус обязателен" });
    }

    const cloth = await prisma.cloth.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(cloth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении статуса одежды" });
  }
});

// app.delete("/rent/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const rental = await prisma.rental.delete({ where: { id: parseInt(id) } });

//     const activeRental = await prisma.rental.findFirst({
//       where: { clothId: rental.clothId },
//     });

//     if (!activeRental) {
//       await prisma.cloth.update({
//         where: { id: rental.clothId },
//         data: { status: "AVAILABLE" },
//       });
//     }

//     res.json({ message: "Бронь отменена", rental });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Ошибка при отмене брони" });
//   }
// });

// ✅ Получить все брони или брони на конкретную дату
app.get("/rentals", async (req, res) => {
  try {
    const { date } = req.query;

    let where = {
      status: {
        not: "CANCELLED",
      },
    };

    if (date) {
      const d = new Date(date);

      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: "Неверный формат даты" });
      }

      where = {
        status: {
          not: "CANCELLED",
        },
        OR: [{ startDate: { lte: d }, endDate: { gte: d } }],
      };
    }

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        cloth: {
          include: {
            photos: true,
          },
        },
        customer: true,
      },
      orderBy: { id: "desc" },
    });

    res.json(addBookingPriceToList(rentals));
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
        status: {
          not: "CANCELLED",
        },
        rentDate: {
          gte: d,
          lt: next,
        },
      },
      include: {
        cloth: {
          include: {
            photos: true,
          },
        },
        customer: true,
      },
      orderBy: { rentDate: "asc" },
    });

    res.json(addBookingPriceToList(rentals));
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

    const cleaningDay = new Date(date);
    cleaningDay.setHours(0, 0, 0, 0);

    const rentStart = new Date(cleaningDay);
    rentStart.setDate(rentStart.getDate() + 1);

    const rentEnd = new Date(rentStart);
    rentEnd.setDate(rentEnd.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
        rentDate: {
          gte: rentStart,
          lt: rentEnd,
        },
      },
      include: {
        cloth: {
          include: { photos: true },
        },
        customer: true,
      },
    });

    res.json(addBookingPriceToList(rentals));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ✅ Брони, созданные сегодня
app.get("/rentals/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rentals = await prisma.rental.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        rentDate: { gte: today },
      },
      include: {
        cloth: {
          include: { photos: true },
        },
        customer: true,
      },
    });

    const rentalsWithBookingPrice = addBookingPriceToList(rentals);

    const totalDeposit = rentalsWithBookingPrice.reduce(
      (sum, rental) => sum + (rental.customer?.deposit || 0),
      0,
    );

    res.json({
      rentals: rentalsWithBookingPrice,
      totalDeposit,
    });
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
        status: {
          not: "CANCELLED",
        },
        endDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        penalty: true,
        customer: true,
        cloth: {
          include: { photos: true },
        },
      },
      orderBy: { endDate: "asc" },
    });

    res.json(addBookingPriceToList(rentals));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при получении аренд с окончанием сегодня",
    });
  }
});
// ✅ Вещи, у которых аренда заканчивается на выбранную дату
app.get("/rentals/ends", async (req, res) => {
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
        status: {
          not: "CANCELLED",
        },
        endDate: {
          gte: d,
          lt: next,
        },
      },
      include: {
        cloth: {
          include: { photos: true },
        },
        customer: true,
      },
    });

    res.json(addBookingPriceToList(rentals));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка" });
  }
});

// Получить все брони за конкретный месяц
app.get("/rentals/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;

    const yearNum = Number(year);
    const monthNum = Number(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Неверный год или месяц" });
    }

    const start = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const end = new Date(Date.UTC(yearNum, monthNum, 1));

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: start,
          lt: end,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        cloth: {
          include: {
            photos: true,
            priceHistory: {
              orderBy: {
                validFrom: "asc",
              },
            },
          },
        },
        customer: true,
        penalty: true,
      },
      orderBy: { rentDate: "asc" },
    });

    res.json(addBookingPriceToList(rentals));
  } catch (error) {
    console.error("Ошибка в /rentals/month/:year/:month:", error);
    res.status(500).json({ message: error.message });
  }
});

// Получить все брони за конкретный год
app.get("/rentals/year/:year", async (req, res) => {
  try {
    const { year } = req.params;

    const yearNum = Number(year);

    if (isNaN(yearNum)) {
      return res.status(400).json({ message: "Неверный год" });
    }

    const start = new Date(Date.UTC(yearNum, 0, 1));
    const end = new Date(Date.UTC(yearNum + 1, 0, 1));

    const rentals = await prisma.rental.findMany({
      where: {
        rentDate: {
          gte: start,
          lt: end,
        },
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        cloth: {
          include: {
            photos: true,
            priceHistory: {
              orderBy: {
                validFrom: "asc",
              },
            },
          },
        },
        customer: true,
        penalty: true,
      },
      orderBy: { rentDate: "asc" },
    });

    res.json(addBookingPriceToList(rentals));
  } catch (error) {
    console.error("Ошибка в /rentals/year/:year:", error);
    res.status(500).json({ message: "Ошибка при получении броней за год" });
  }
});

// ✅ Отмена брони без удаления
app.patch("/rentals/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Cancel rental id:", id);

    const existingRental = await prisma.rental.findUnique({
      where: { id: Number(id) },
      include: {
        cloth: true,
        customer: true,
      },
    });

    if (!existingRental) {
      return res.status(404).json({ message: "Бронь не найдена" });
    }

    if (existingRental.status === "CANCELLED") {
      return res.status(400).json({ message: "Бронь уже отменена" });
    }

    if (existingRental.status === "RETURNED") {
      return res.status(400).json({
        message: "Нельзя отменить уже возвращенную аренду",
      });
    }

    const rental = await prisma.rental.update({
      where: { id: Number(id) },
      data: {
        status: "CANCELLED",
        cloth: {
          update: {
            status: "AVAILABLE",
          },
        },
      },
      include: {
        cloth: {
          include: {
            photos: true,
          },
        },
        customer: true,
      },
    });

    console.log("Rental cancelled:", rental.id, rental.status);

    res.json({
      message: "Бронь отменена. Депозит не возвращается.",
      rental,
    });
  } catch (error) {
    console.error("Cancel rental error:", error);
    res.status(500).json({ message: "Ошибка при отмене брони" });
  }
});

// ✅ Отмененные брони за выбранную дату
app.get("/rentals/cancelled", async (req, res) => {
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
        status: "CANCELLED",
        rentDate: {
          gte: d,
          lt: next,
        },
      },
      include: {
        cloth: {
          include: {
            photos: true,
          },
        },
        customer: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    res.json(rentals);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка при получении отмененных броней",
    });
  }
});

// Обновление статуса брони + автоматическое обновление статуса одежды
app.patch("/rentals/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "RESERVED",
      "CLEANING",
      "RENTED",
      "RETURNED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Неверный статус аренды" });
    }

    const clothStatus = getClothStatusByRentalStatus(status);

    const rental = await prisma.rental.update({
      where: { id: Number(id) },
      data: {
        status,
        cloth: {
          update: {
            status: clothStatus,
          },
        },
      },
      include: {
        penalty: true,
        cloth: {
          include: {
            photos: true,
          },
        },
        customer: true,
      },
    });

    res.json(rental);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении статуса брони" });
  }
});

// ✅ Добавить / обновить штраф для аренды
app.patch("/rentals/:id/penalty", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason, description } = req.body;

    const penaltyAmount = Number(amount);

    if (!penaltyAmount || penaltyAmount <= 0) {
      return res.status(400).json({
        message: "Сумма штрафа должна быть больше 0",
      });
    }

    const allowedReasons = [
      "DAMAGE",
      "DIRTY",
      "LOST_ITEM",
      "LATE_RETURN",
      "OTHER",
    ];

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        message: "Неверная причина штрафа",
      });
    }

    const existingRental = await prisma.rental.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRental) {
      return res.status(404).json({
        message: "Аренда не найдена",
      });
    }

    const rental = await prisma.rental.update({
      where: { id: Number(id) },
      data: {
        penalty: {
          upsert: {
            create: {
              amount: penaltyAmount,
              reason,
              description: description || "",
            },
            update: {
              amount: penaltyAmount,
              reason,
              description: description || "",
            },
          },
        },
      },
      include: {
        penalty: true,
        customer: true,
        cloth: {
          include: {
            photos: true,
          },
        },
      },
    });

    res.json(rental);
  } catch (error) {
    console.error("Penalty error:", error);
    res.status(500).json({
      message: "Ошибка при сохранении штрафа",
    });
  }
});

// ✅ Удалить штраф
app.delete("/rentals/:id/penalty", async (req, res) => {
  try {
    const { id } = req.params;

    const existingRental = await prisma.rental.findUnique({
      where: { id: Number(id) },
      include: {
        penalty: true,
      },
    });

    if (!existingRental) {
      return res.status(404).json({
        message: "Аренда не найдена",
      });
    }

    if (!existingRental.penalty) {
      return res.status(400).json({
        message: "У этой аренды нет штрафа",
      });
    }

    await prisma.penalty.delete({
      where: {
        rentalId: Number(id),
      },
    });

    const rental = await prisma.rental.findUnique({
      where: { id: Number(id) },
      include: {
        penalty: true,
        customer: true,
        cloth: {
          include: {
            photos: true,
          },
        },
      },
    });

    res.json(rental);
  } catch (error) {
    console.error("Delete penalty error:", error);
    res.status(500).json({
      message: "Ошибка при удалении штрафа",
    });
  }
});

// Изменение цены одежды с сохранением истории
app.patch("/clothes/:id/price", async (req, res) => {
  try {
    const { id } = req.params;
    const { price, validFrom } = req.body;

    const clothId = Number(id);
    const newPrice = Number(price);

    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({
        message: "Цена должна быть больше 0",
      });
    }

    if (!validFrom) {
      return res.status(400).json({
        message: "Дата начала действия цены обязательна",
      });
    }

    const startDate = new Date(validFrom);

    if (isNaN(startDate)) {
      return res.status(400).json({
        message: "Неверный формат даты",
      });
    }

    const updatedCloth = await prisma.$transaction(async (tx) => {
      const existingCloth = await tx.cloth.findUnique({
        where: { id: clothId },
        include: {
          priceHistory: true,
        },
      });

      if (!existingCloth) {
        throw new Error("Одежда не найдена");
      }

      await tx.clothPriceHistory.updateMany({
        where: {
          clothId,
          validTo: null,
        },
        data: {
          validTo: startDate,
        },
      });

      await tx.clothPriceHistory.create({
        data: {
          clothId,
          price: newPrice,
          validFrom: startDate,
          validTo: null,
        },
      });

      return tx.cloth.update({
        where: { id: clothId },
        data: {
          price: newPrice,
        },
        include: {
          photos: true,
          rentals: true,
          priceHistory: true,
        },
      });
    });

    res.json(updatedCloth);
  } catch (error) {
    console.error(error);

    if (error.message === "Одежда не найдена") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Ошибка при изменении цены",
    });
  }
});

// ✅ Запускаем сервер
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
