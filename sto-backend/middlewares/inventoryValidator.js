const prisma = require('../lib/prisma');

const validateInventoryItem = async (req, res, next) => {
  let { name, category } = req.body;
  const { id } = req.params;

  // 1. Очищення від зайвих пробілів (Trim)
  if (name) name = name.trim();
  if (category) category = category.trim();

  // Оновлюємо req.body очищеними даними
  req.body.name = name;
  req.body.category = category;

  if (!name) {
    return res.status(400).json({ error: "Назва товару обов'язкова" });
  }

  try {
    // 2. Перевірка на дублікати (case-insensitive)
    const existingItem = await prisma.inventory.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', 
        },
        // Якщо це оновлення, ігноруємо поточний товар
        NOT: id ? { id: Number(id) } : undefined
      }
    });

    if (existingItem) {
      return res.status(400).json({ error: `Товар з назвою "${name}" вже існує на складі` });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Помилка валідації", details: error.message });
  }
};

module.exports = { validateInventoryItem };