// Підключаємо спільний клієнт Prisma
const prisma = require('../lib/prisma');

// Отримати всі спеціалізації майстрів
exports.getAllStaffCategories = async (req, res) => {
  try {
    const categories = await prisma.staffCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Помилка завантаження спеціалізацій" });
  }
};

// Створити нову спеціалізацію (напр. "Електрик")
exports.createStaffCategory = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Назва не може бути порожньою" });
  }
  try {
    const newCategory = await prisma.staffCategory.create({
      data: { name: name.trim() }
    });
    res.json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Така спеціалізація вже існує" });
  }
};

// Видалення спеціалізації
exports.deleteStaffCategory = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.$transaction([
      // Відв'язуємо персонал від цієї спеціалізації (SetNull)
      prisma.staff.updateMany({
        where: { staffCategoryId: id },
        data: { staffCategoryId: null }
      }),
      // Видаляємо саму категорію
      prisma.staffCategory.delete({
        where: { id: id }
      })
    ]);
    res.json({ message: "Спеціалізацію видалено" });
  } catch (error) {
    console.error("DELETE_STAFF_CATEGORY_ERROR:", error.message);
    res.status(400).json({ error: "Не вдалося видалити спеціалізацію" });
  }
};