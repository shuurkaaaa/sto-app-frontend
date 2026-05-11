const express = require('express');
const router = express.Router();

const prisma = require('../lib/prisma');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

/**
 * POST /api/purchase/create
 * Створення нового замовлення на закупівлю запчастин
 */
router.post('/create', async (req, res) => {
  try {
    const { items, totalPrice, status } = req.body;


    const finalPrice = isNaN(parseFloat(totalPrice)) ? 0 : parseFloat(totalPrice);


    const newOrder = await prisma.purchaseOrder.create({
      data: {
        totalPrice: finalPrice,
        status: status || 'Pending',

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