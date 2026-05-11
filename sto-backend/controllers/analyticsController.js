const prisma = require('../lib/prisma');
const { startOfDay, startOfWeek, startOfMonth } = require('date-fns');

// 🚀 IN-MEMORY CACHE
const analyticsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

exports.getAnalyticsSummary = async (req, res) => {
  const { period = 'month' } = req.query;
  const now = new Date();
  const cacheKey = `analytics_${period}`;

  // Check cache
  const cached = analyticsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`📊 Cache hit for ${period}`);
    return res.json(cached.data);
  }

  let startDate;
  if (period === 'day') {
    startDate = startOfDay(now);
  } else if (period === 'week') {
    startDate = startOfWeek(now, { weekStartsOn: 1 });
  } else {
    startDate = startOfMonth(now);
  }

  try {
    console.log(`⚡ Loading analytics for period: ${period}`);


    const [stats, carsInWork, customersCount, topWorkersRaw, serviceStatsRaw, chartDataRaw] = await Promise.all([

      prisma.order.aggregate({
        _sum: { totalPrice: true },
        _count: { id: true },
        _avg: { totalPrice: true },
        where: {
          status: 'COMPLETED',
          completedAt: { gte: startDate }
        }
      }),


      prisma.order.count({
        where: {
          status: { in: ['IN_WORK', 'READY'] }
        }
      }),


      prisma.customer.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),


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


    const topWorkers = topWorkersRaw.map(w => ({
      id: w.id,
      name: w.name,
      role: w.role,
      earnings: w.orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0)
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);


    const serviceStats = serviceStatsRaw
      .filter(s => s._count.orders > 0)
      .map(s => ({
        name: s.name,
        count: s._count.orders
      }));


    const chartData = chartDataRaw.map(o => ({
      name: new Date(o.completedAt).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit'
      }),
      revenue: Number(o.totalPrice) || 0
    }));

    const responseData = {
      totalRevenue: Number(stats._sum.totalPrice) || 0,
      completedOrdersCount: stats._count.id || 0,
      averageCheck: Math.round(Number(stats._avg.totalPrice) || 0),
      carsInWork,
      customersCount,
      serviceStats,
      topWorkers,
      chartData,
      period,
      cached: false
    };

    // Store in cache
    analyticsCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    console.log(`✅ Analytics cached for ${period}`);

    res.json(responseData);

  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({
      error: "Server error when generating analytics",
      details: error.message
    });
  }
};

exports.clearAnalyticsCache = (req, res) => {
  try {
    analyticsCache.clear();
    console.log(`🗑️ Analytics cache cleared`);
    res.json({ success: true, message: 'Analytics cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};