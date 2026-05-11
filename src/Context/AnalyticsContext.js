import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [timeRange, setTimeRange] = useState(() => {
    return localStorage.getItem('oneway_timeRange') || 'month';
  });

  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('oneway_stats');
    return savedStats ? JSON.parse(savedStats) : {
      totalRevenue: 0,
      completedOrdersCount: 0,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ ЗАВЖДИ запитуємо свіжі дані (забороняємо кеш браузера)
      const res = await apiClient.get(`/analytics/summary`, {
        params: { period: timeRange, _t: Date.now() }
      });
      const data = res.data || {};

      const newStats = {
        totalRevenue: Number(data.totalRevenue) || 0,
        completedOrdersCount: Number(data.completedOrdersCount) || 0,
        customersCount: Number(data.customersCount) || 0,
        averageCheck: Number(data.averageCheck) || 0,
        carsInWork: Number(data.carsInWork) || 0,
      };

      const services = Array.isArray(data.serviceStats) ? data.serviceStats : [];
      const popular = services
        .map(s => ({ name: s.name, count: Number(s.count) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const workers = Array.isArray(data.topWorkers) ? data.topWorkers : [];

      // ✅ Оновлюємо ВСІ STATE (без localStorage)
      setStats(newStats);
      setPopularServices(popular);
      setTopWorkers(workers);
      setChartData(Array.isArray(data.chartData) ? data.chartData : []);

      console.log(`✅ Analytics оновлено для ${timeRange}`);
    } catch (e) {
      console.error('Analytics load error:', e);
      setError(e?.response?.data?.message || e?.message || 'Не вдалося завантажити аналітику');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // ✅ Оновлюємо коли змінюється timeRange
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, timeRange]);

  const value = {
    stats,
    popularServices,
    topWorkers,
    timeRange,
    setTimeRange,
    chartData,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
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