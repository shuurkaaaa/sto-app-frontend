const prisma = require('../lib/prisma');

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Немає товарів для замовлення" });
    }


    const total = items.reduce((sum, item) => {
      const qty = Number(item.minimum || 0) - Number(item.current || 0);
      const price = Number(item.price || 0);
      return sum + (Math.max(0, qty) * price);
    }, 0);


    const newOrder = await prisma.purchaseOrder.create({
      data: {
        totalPrice: total,
        status: "Надіслано",
        OrderItem: {
          create: items.map(item => ({
            itemName: item.name,
            sku: String(item.stockKeepingUnit || item.sku || "н/д"),
            quantityOrdered: Math.max(0, Number(item.minimum || 0) - Number(item.current || 0)),
            priceAtOrder: Number(item.price || 0)
          }))
        }
      },
      include: { OrderItem: true }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Помилка при збереженні замовлення",
      details: error.message
    });
  }
};

exports.getOrdersHistory = async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { OrderItem: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Не вдалося отримати історію" });
  }
};