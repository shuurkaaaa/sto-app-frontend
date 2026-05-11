const prisma = require('../lib/prisma');


exports.getInventoryWithHistory = async (req, res) => {
  try {
    const items = await prisma.inventory.findMany({
      include: {
        category: true,
        technicalData: true,
        logs: { orderBy: { date: 'desc' } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання даних" });
  }
};


exports.getItemLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await prisma.inventoryLog.findMany({
      where: { itemId: parseInt(id, 10) },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання історії товару" });
  }
};


exports.getAllLogs = async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: { item: true },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання логів" });
  }
};