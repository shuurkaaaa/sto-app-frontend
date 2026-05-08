const prisma = require('../lib/prisma');

/**
 * Отримання всіх сповіщень: склад, сервіс, затримки та замітки (Архів 24г)
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = [];
    const today = new Date();
    
    // МЕХАНІЗМ АРХІВУ: Замітки старіші за 24 години автоматично не завантажуються
    const archiveThreshold = new Date(today.getTime() - (24 * 60 * 60 * 1000));

    // Отримуємо всі ID сповіщень, які користувач уже приховав (isDismissed: true)
    const dismissedLogs = await prisma.notification.findMany({
      where: { isDismissed: true },
      select: { id: true }
    });
    const dismissedIds = new Set(dismissedLogs.map(log => String(log.id)));

    // 1. ПЕРЕВІРКА СКЛАДУ (Inventory)
    try {
      const allItems = await prisma.inventory.findMany();
      const deficitItems = allItems.filter(item => item.current <= item.minimum);

      deficitItems.forEach(item => {
        const systemId = `inventory-${item.id}`;
        
        // Додаємо, тільки якщо не приховано користувачем
        if (!dismissedIds.has(systemId)) {
          notifications.push({
            id: systemId, 
            type: 'inventory',
            priority: 'high',
            title: 'Дефіцит на складі',
            message: `Запчастина "${item.name}" закінчується. Залишок: ${item.current} шт.`,
            date: today.toLocaleString('uk-UA'),
            current: item.current,
            minimum: item.minimum,
            itemName: item.name
          });
        }
      });
    } catch (e) {
      console.error("⚠️ Помилка Inventory:", e.message);
    }

    // 2. СЕРВІСНІ НАГАДУВАННЯ (6 місяців після завершеного замовлення)
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const oldOrders = await prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { lte: sixMonthsAgo }
        },
        include: { customer: true }
      });

      oldOrders.forEach(order => {
        const systemId = `service-${order.id}`;
        
        if (!dismissedIds.has(systemId)) {
          notifications.push({
            id: systemId,
            type: 'service',
            priority: 'medium',
            title: 'Час для ТО',
            message: `Клієнт ${order.customer?.name || 'Клієнт'} потребує планового огляду.`,
            date: order.completedAt ? new Date(order.completedAt).toLocaleDateString('uk-UA') : today.toLocaleDateString('uk-UA')
          });
        }
      });
    } catch (e) {
      console.error("⚠️ Помилка Service:", e.message);
    }

    // 3. ЗАТРИМКИ В РОБОТІ (Понад 3 дні в статусі IN_WORK)
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3);

      const delayedOrders = await prisma.order.findMany({
        where: {
          status: 'IN_WORK',
          createdAt: { lte: threeDaysAgo }
        }
      });

      delayedOrders.forEach(order => {
        const systemId = `delay-${order.id}`;
        
        if (!dismissedIds.has(systemId)) {
          notifications.push({
            id: systemId,
            type: 'delay',
            priority: 'high',
            title: 'Затримка замовлення',
            message: `Автомобіль ${order.carDetails || 'в роботі'} затримався (понад 3 дні).`,
            date: new Date(order.createdAt).toLocaleString('uk-UA')
          });
        }
      });
    } catch (e) {
      console.error("⚠️ Помилка затримок:", e.message);
    }

    // 4. РУЧНІ ЗАМІТКИ
    try {
      const manualNotes = await prisma.notification.findMany({
        where: { 
          type: 'manual',
          isDismissed: false,
          createdAt: { 
            lte: today,
            gte: archiveThreshold
          } 
        },
        orderBy: { createdAt: 'desc' }
      });

      manualNotes.forEach(note => {
        notifications.push({
          id: String(note.id),
          type: 'manual',
          priority: note.priority || 'medium',
          title: note.title,
          message: note.message,
          date: new Date(note.createdAt).toLocaleString('uk-UA')
        });
      });
    } catch (e) {
      console.error("⚠️ Помилка ручних заміток:", e.message);
    }

    // Сортування: Високий пріоритет завжди зверху
    const sortedResult = notifications.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });

    res.json(sortedResult);

  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА КОНТРОЛЕРА:', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера', details: error.message });
  }
};

/**
 * Створення нової замітки
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, priority, scheduledAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Заповніть обов'язкові поля" });
    }

    const newNote = await prisma.notification.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        priority: priority || 'medium',
        type: 'manual',
        isRead: false,
        isDismissed: false,
        createdAt: scheduledAt ? new Date(scheduledAt) : new Date()
      }
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error('❌ ПОМИЛКА СТВОРЕННЯ ЗАМІТКИ:', error);
    res.status(500).json({ error: 'Не вдалося створити замітку' });
  }
};

/**
 * Видалення або приховання сповіщення
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Перевірка на системне сповіщення (містить дефіс)
    if (String(id).includes('-')) {
      await prisma.notification.upsert({
        where: { id: String(id) },
        update: { isDismissed: true },
        create: {
          id: String(id),
          type: id.split('-')[0],
          title: 'Приховане сповіщення',
          message: 'System dismissal record',
          priority: 'low',
          isDismissed: true,
          isRead: true
        }
      });
      return res.json({ success: true, message: "Системне сповіщення приховано" });
    }

    // Для ручних заміток: перевіряємо, чи ID числове чи UUID
    const numericId = parseInt(id);
    const finalId = isNaN(numericId) ? id : numericId;

    await prisma.notification.update({
      where: { id: finalId },
      data: { isDismissed: true }
    });
    
    res.json({ success: true, message: "Замітку приховано" });
  } catch (error) {
    console.error('❌ ПОМИЛКА ВИДАЛЕННЯ:', error);
    res.status(500).json({ error: 'Не вдалося видалити сповіщення', details: error.message });
  }
};

/**
 * Очищення ручних заміток
 */
const clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { type: 'manual' },
      data: { isDismissed: true }
    });
    res.json({ success: true, message: "Всі замітки приховано" });
  } catch (error) {
    console.error('❌ ПОМИЛКА ОЧИЩЕННЯ:', error);
    res.status(500).json({ error: "Не вдалося очистити список" });
  }
};

module.exports = { 
  getNotifications, 
  createNotification, 
  deleteNotification, 
  clearAllNotifications 
};