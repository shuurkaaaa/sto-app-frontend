const prisma = require('../lib/prisma');

// --- РОБОТА З МАРКАМИ (BRANDS) ---

// Отримати всі марки разом із їхніми моделями
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await prisma.carBrand.findMany({
      include: {
        models: true, // Включаємо масив моделей для кожної марки
      },
      orderBy: {
        name: 'asc', // Сортування за алфавітом
      },
    });
    res.json(brands);
  } catch (error) {
    console.error("Помилка при отриманні марок:", error);
    res.status(500).json({ error: "Не вдалося завантажити список марок" });
  }
};

// Створити нову марку
exports.createBrand = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Назва марки обов'язкова" });
  }

  try {
    const brand = await prisma.carBrand.create({
      data: { name: name.trim() },
    });
    res.status(201).json(brand);
  } catch (error) {
    console.error("Помилка при створенні марки:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Така марка вже існує в базі" });
    }
    res.status(500).json({ error: "Помилка сервера при створенні марки" });
  }
};

// Оновити назву марки
exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedBrand = await prisma.carBrand.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
    });
    res.json(updatedBrand);
  } catch (error) {
    console.error("Помилка при оновленні марки:", error);
    res.status(400).json({ error: "Не вдалося оновити марку" });
  }
};

// Видалити марку
exports.deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.carBrand.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // Успішно видалено
  } catch (error) {
    console.error("Помилка при видаленні марки:", error);
    res.status(400).json({ error: "Помилка при видаленні марки. Можливо, вона вже видалена." });
  }
};

// --- РОБОТА З МОДЕЛЯМИ (MODELS) ---

// Створити нову модель для конкретної марки
exports.createModel = async (req, res) => {
  const { name, brandId } = req.body;

  if (!name || !brandId) {
    return res.status(400).json({ error: "Назва моделі та ID марки обов'язкові" });
  }

  try {
    const model = await prisma.carModel.create({
      data: {
        name: name.trim(),
        brandId: parseInt(brandId),
      },
    });
    res.status(201).json(model);
  } catch (error) {
    console.error("Помилка при створенні моделі:", error);
    res.status(500).json({ error: "Не вдалося додати модель" });
  }
};

// Оновити назву моделі
exports.updateModel = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedModel = await prisma.carModel.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
    });
    res.json(updatedModel);
  } catch (error) {
    console.error("Помилка при оновленні моделі:", error);
    res.status(400).json({ error: "Не вдалося оновити назву моделі" });
  }
};

// Видалити модель
exports.deleteModel = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.carModel.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Помилка при видаленні моделі:", error);
    res.status(400).json({ error: "Помилка при видаленні моделі" });
  }
};