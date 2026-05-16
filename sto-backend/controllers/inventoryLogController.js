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
    const orderId = req.query.orderId;
    const where = { itemId: parseInt(id, 10) };
    if (orderId !== undefined && orderId !== '' && orderId !== null) {
      const oid = parseInt(orderId, 10);
      if (!isNaN(oid)) where.orderId = oid;
    }
    const logs = await prisma.inventoryLog.findMany({
      where,
      include: { order: { select: { id: true } } },
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
      include: { item: true, order: { select: { id: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Помилка отримання логів" });
  }
};

/** Списання / рух по конкретному сервісному замовленню (CRM Order.id) */
exports.getLogsByOrderId = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Некоректний orderId' });
    }
    const logs = await prisma.inventoryLog.findMany({
      where: { orderId },
      include: { item: { select: { id: true, name: true, stockKeepingUnit: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Помилка отримання історії за замовленням' });
  }
};