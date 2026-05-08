const express = require('express');
const router = express.Router();
// Підключаємо ваш спільний клієнт Prisma
const prisma = require('../lib/prisma');

/**
 * POST /api/purchase/create
 * Створення нового замовлення на закупівлю запчастин
 */
router.post('/create', async (req, res) => {
  try {
    const { items, totalPrice, status } = req.body;

    // Безпечне перетворення ціни в число
    const finalPrice = isNaN(parseFloat(totalPrice)) ? 0 : parseFloat(totalPrice);

    // Використовуємо підключений prisma для запису в БД
    const newOrder = await prisma.purchaseOrder.create({
      data: {
        totalPrice: finalPrice,
        status: status || 'Pending',
        // Перетворюємо масив запчастин у рядок для зберігання в SQLite
        items: items ? JSON.stringify(items) : "[]", 
        createdAt: new Date(),
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('ПОМИЛКА БД ПРИ СТВОРЕННІ ЗАКУПІВЛІ:', error);
    res.status(500).json({ 
      error: 'Помилка при створенні замовлення',
      details: error.message 
    });
  }
});

/**
 * GET /api/purchase/history
 * Отримання історії всіх закупівель
 */
router.get('/history', async (req, res) => {
  try {
    const history = await prisma.purchaseOrder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Перетворюємо рядки JSON назад в об'єкти для фронтенда
    const formattedHistory = history.map(order => {
      let parsedItems = [];
      try {
        parsedItems = order.items ? JSON.parse(order.items) : [];
      } catch (e) {
        parsedItems = [];
      }

      return {
        ...order,
        items: parsedItems
      };
    });
    
    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося завантажити історію замовлень' });
  }
});

module.exports = router;