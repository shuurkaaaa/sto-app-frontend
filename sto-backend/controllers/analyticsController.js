const prisma = require('../lib/prisma');
const { startOfDay, startOfWeek, startOfMonth } = require('date-fns');

exports.getAnalyticsSummary = async (req, res) => {
  const { period = 'month' } = req.query;
  const now = new Date();
  
  let startDate;
  if (period === 'day') {
    startDate = startOfDay(now);
  } else if (period === 'week') {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
  } else {
    startDate = startOfMonth(now);
  }

  try {
    console.log(`Запуск оптимізованої аналітики OneWayLogistic за період: ${period}`);

    // Використовуємо Promise.all для паралельного виконання запитів до БД
    const [stats, carsInWork, customersCount, topWorkersRaw, serviceStatsRaw, chartDataRaw] = await Promise.all([
      // 1. Основна агрегація (Прибуток, Кількість, Середній чек)
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        _count: { id: true },
        _avg: { totalPrice: true },
        where: {
          status: 'COMPLETED',
          completedAt: { gte: startDate }
        }
      }),

      // 2. Машини в роботі
      prisma.order.count({
        where: { 
          status: { in: ['IN_WORK', 'READY'] } 
        }
      }),

      // 3. Нові клієнти
      prisma.customer.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // 4. Рейтинг майстрів (агрегуємо тільки потрібні дані)
      prisma.staff.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          name: true,
          role: true,
          orders: {
            where: {
              status: 'COMPLETED',
              completedAt: { gte: startDate }
            },
            select: { totalPrice: true }
          }
        }
      }),

      // 5. Популярні послуги (через count зв'язків)
      prisma.service.findMany({
        select: {
          name: true,
          _count: {
            select: { 
              orders: {
                where: {
                  status: 'COMPLETED',
                  completedAt: { gte: startDate }
                }
              } 
            }
          }
        },
        orderBy: {
          orders: { _count: 'desc' }
        },
        take: 8
      }),

      // 6. Дані для графіка (останні 15 точок для швидкості)
      prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: startDate }
        },
        select: {
          completedAt: true,
          totalPrice: true
        },
        orderBy: {
          completedAt: 'asc'
        },
        take: 20
      })
    ]);

    // Обробка рейтингу майстрів
    const topWorkers = topWorkersRaw.map(w => ({
      id: w.id,
      name: w.name,
      role: w.role,
      earnings: w.orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);

    // Обробка статистики послуг
    const serviceStats = serviceStatsRaw
      .filter(s => s._count.orders > 0)
      .map(s => ({
        name: s.name,
        count: s._count.orders
      }));

    // Обробка даних для графіка
    const chartData = chartDataRaw.map(o => ({
      name: new Date(o.completedAt).toLocaleDateString('uk-UA', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      revenue: Number(o.totalPrice) || 0
    }));

    console.log(`Аналітика сформована успішно для ${period}`);

    res.json({
      totalRevenue: Number(stats._sum.totalPrice) || 0,
      completedOrdersCount: stats._count.id || 0,
      averageCheck: Math.round(Number(stats._avg.totalPrice) || 0),
      carsInWork,
      customersCount,
      serviceStats,
      topWorkers,
      chartData,
      period
    });

  } catch (error) {
    console.error("Помилка при генерації звітності:", error);
    res.status(500).json({ 
      error: "Помилка сервера при формуванні аналітики", 
      details: error.message 
    });
  }
};