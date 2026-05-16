const prisma = require('../lib/prisma');
const { startOfDay, startOfWeek, startOfMonth, format, parse } = require('date-fns');

const analyticsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

exports.getAnalyticsSummary = async (req, res) => {
  const { period = 'month' } = req.query;
  const now = new Date();
  const cacheKey = `analytics_${period}`;

  const cached = analyticsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
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
          commissionPercent: true,
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
        }
      })
    ]);


    const topWorkers = topWorkersRaw.map(w => {
      const commissionRate = (Number(w.commissionPercent) || 0) / 100;
      const totalServiced = w.orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
      const earnings = +(totalServiced * commissionRate).toFixed(2);
      return {
        id: w.id,
        name: w.name,
        role: w.role,
        commissionPercent: Number(w.commissionPercent) || 0,
        ordersCount: w.orders.length,
        totalServiced,
        earnings,
      };
    })
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);


    const serviceStats = serviceStatsRaw
      .filter(s => s._count.orders > 0)
      .map(s => ({
        name: s.name,
        count: s._count.orders
      }));


    const revenueByDay = new Map();
    for (const o of chartDataRaw) {
      if (!o.completedAt) continue;
      const dayKey = format(o.completedAt, 'yyyy-MM-dd');
      const prev = revenueByDay.get(dayKey) || 0;
      revenueByDay.set(dayKey, prev + (Number(o.totalPrice) || 0));
    }
    const sortedDayKeys = [...revenueByDay.keys()].sort();
    const chartData = sortedDayKeys.map((sortKey) => {
      const dayRef = parse(sortKey, 'yyyy-MM-dd', new Date());
      return {
        name: format(dayRef, 'dd.MM'),
        revenue: revenueByDay.get(sortKey)
      };
    });

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

    analyticsCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.json(responseData);

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: "Server error when generating analytics",
      details: error.message
    });
  }
};

exports.clearAnalyticsCache = (req, res) => {
  try {
    analyticsCache.clear();
    res.json({ success: true, message: 'Analytics cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.invalidateAnalyticsCache = () => {
  analyticsCache.clear();
};