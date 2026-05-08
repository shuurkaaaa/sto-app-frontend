const prisma = require('../lib/prisma');

const getPriceCategories = async (req, res) => {
  try {
    const categories = await prisma.priceCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error("Помилка завантаження категорій:", error);
    res.status(500).json({ error: "Помилка завантаження категорій прайсу" });
  }
};

const createPriceCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.priceCategory.create({
      data: { name: String(name) }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Помилка створення категорії:", error);
    res.status(500).json({ error: "Помилка створення категорії" });
  }
};

const updatePriceCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedCategory = await prisma.priceCategory.update({
      where: { id: parseInt(id) },
      data: { name: String(name) }
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error("Помилка оновлення категорії:", error);
    res.status(500).json({ error: "Помилка оновлення назви категорії" });
  }
};

const deletePriceCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.priceCategory.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Помилка видалення категорії:", error);
    res.status(500).json({ error: "Помилка видалення категорії" });
  }
};

module.exports = { 
  getPriceCategories, 
  createPriceCategory, 
  updatePriceCategory, 
  deletePriceCategory 
};