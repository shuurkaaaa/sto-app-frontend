import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOrders } from './OrdersContext';
import { useClients } from './ClientsContext';
import { useWorkers } from './WorkersContext';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const { orders } = useOrders();
  const { clients } = useClients();
  const { workers } = useWorkers();

  // Додаємо стан для вибору періоду: 'day', 'week', 'month'
  const [timeRange, setTimeRange] = useState(() => {
    return localStorage.getItem('oneway_timeRange') || 'month';
  });

  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('oneway_stats');
    return savedStats ? JSON.parse(savedStats) : {
      totalRevenue: 0,
      ordersCount: 0,
      customersCount: 0,
      averageCheck: 0,
      carsInWork: 0
    };
  });

  const [popularServices, setPopularServices] = useState(() => {
    const savedServices = localStorage.getItem('oneway_popular');
    return savedServices ? JSON.parse(savedServices) : [];
  });

  const [topWorkers, setTopWorkers] = useState(() => {
    const savedWorkers = localStorage.getItem('oneway_workers');
    return savedWorkers ? JSON.parse(savedWorkers) : [];
  });

  const [chartData, setChartData] = useState([]);

  const calculateAnalytics = useCallback(() => {
    if (!orders || orders.length === 0) return;

    const now = new Date();
    let startDate = new Date();

    // Визначаємо початкову дату залежно від вибраного періоду
    if (timeRange === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      const day = startDate.getDay() || 7; // Понеділок - 1
      startDate.setDate(startDate.getDate() - (day - 1));
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Місяць
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Фільтруємо виконані замовлення за новим полем completedAt (або createdAt як запасний варіант)
    const completedOrders = orders.filter(o => {
      const isDone = o.status === 'Виконано' || o.status === 'completed' || o.status === 'COMPLETED';
      const orderDate = new Date(o.completedAt || o.createdAt);
      return isDone && orderDate >= startDate;
    });
    
    // 2. Рахуємо прибуток
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total || o.totalPrice) || 0), 0);
    
    // 3. Середній чек
    const averageCheck = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

    // 4. Машини в роботі (поточний статус, незалежно від вибраного періоду дати)
    const carsInWork = orders.filter(o => o.status === 'В роботі' || o.status === 'IN_WORK').length;

    // 5. Нові клієнти за вибраний період
    const newClientsCount = (clients || []).filter(c => {
        const cDate = new Date(c.createdAt || c.date || now);
        return cDate >= startDate;
    }).length;

    // 6. Популярні послуги за вибраний період
    const serviceCounts = {};
    completedOrders.forEach(order => {
      if (order.services && Array.isArray(order.services)) {
        order.services.forEach(s => {
          const name = s.name || s.label || "Інше";
          serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        });
      }
    });

    const popular = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 7. Рейтинг майстрів за вибраний період
    const workerStats = (workers || []).map(worker => {
        const workerOrders = completedOrders.filter(o => o.masterId === worker.id || o.master === worker.name || o.masterId === String(worker.id));
        const earned = workerOrders.reduce((sum, o) => sum + (Number(o.total || o.totalPrice) || 0), 0);
        return {
            id: worker.id,
            name: worker.name,
            role: worker.role || worker.position,
            totalEarned: earned
        };
    }).sort((a, b) => b.totalEarned - a.totalEarned);

    // 8. Дані для графіка (останні замовлення періоду)
    const chart = completedOrders.slice(-10).map(o => ({
      name: new Date(o.completedAt || o.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
      revenue: Number(o.total || o.totalPrice)
    }));

    // Оновлюємо стейти
    const newStats = {
      totalRevenue,
      ordersCount: completedOrders.length,
      customersCount: newClientsCount,
      averageCheck,
      carsInWork
    };

    setStats(newStats);
    setPopularServices(popular);
    setTopWorkers(workerStats);
    setChartData(chart);

    // Зберігаємо результати
    localStorage.setItem('oneway_stats', JSON.stringify(newStats));
    localStorage.setItem('oneway_popular', JSON.stringify(popular));
    localStorage.setItem('oneway_workers', JSON.stringify(workerStats));
    localStorage.setItem('oneway_timeRange', timeRange);

  }, [orders, clients, workers, timeRange]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const value = {
    stats,
    popularServices,
    topWorkers,
    timeRange,
    setTimeRange,
    chartData,
    loading: !orders.length,
    error: null,
    refreshAnalytics: calculateAnalytics
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
};