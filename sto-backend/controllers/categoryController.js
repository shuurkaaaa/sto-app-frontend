const prisma = require('../lib/prisma');

// Отримання всіх категорій складу
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error("Помилка отримання категорій:", error);
    res.status(500).json({ error: "Не вдалося завантажити категорії складу" });
  }
};

// Створення нової категорії складу
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Назва категорії обов'язкова" });
  }
  try {
    const newCategory = await prisma.category.create({
      data: { name: name.trim() }
    });
    res.json(newCategory);
  } catch (error) {
    console.error("Помилка створення категорії:", error);
    res.status(400).json({ error: "Категорія з такою назвою вже існує" });
  }
};

// Оновлення назви категорії складу
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Назва не може бути порожньою" });
  }
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name: name.trim() }
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error("Помилка оновлення категорії:", error);
    res.status(400).json({ error: "Не вдалося оновити категорію" });
  }
};

// Видалення категорії складу
const deleteCategory = async (req, res) => {
  const id = Number(req.params.id);
  try {
    // Використовуємо транзакцію, щоб безпечно відв'язати товари від категорії перед її видаленням
    await prisma.$transaction([
      prisma.inventory.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      }),
      prisma.category.delete({
        where: { id: id }
      })
    ]);
    res.json({ message: "Категорію успішно видалено зі складу" });
  } catch (error) {
    console.error("Помилка видалення категорії:", error);
    res.status(400).json({ error: "Не вдалося видалити категорію" });
  }
};

// Експорт усіх функцій
module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};