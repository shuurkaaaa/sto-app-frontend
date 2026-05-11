const prisma = require('../lib/prisma');

const validateInventoryItem = async (req, res, next) => {
  let { name, category } = req.body;
  const { id } = req.params;


  if (name) name = name.trim();
  if (category) category = category.trim();


  req.body.name = name;
  req.body.category = category;

  if (!name) {
    return res.status(400).json({ error: "Назва товару обов'язкова" });
  }

  try {

    const existingItem = await prisma.inventory.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },

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