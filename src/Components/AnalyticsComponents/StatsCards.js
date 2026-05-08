import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';
import { analyticsStyles } from './AnalyticsStyles';

export const StatsCards = () => {
  const { stats, loading, timeRange } = useAnalytics();

  // Функція для гарного відображення назви періоду в заголовку картки
  const getPeriodLabel = () => {
    switch (timeRange) {
      case 'day': return '(день)';
      case 'week': return '(тиждень)';
      case 'month': return '(місяць)';
      default: return '';
    }
  };

  const cards = [
    { 
      label: `Прибуток ${getPeriodLabel()}`, 
      value: `${stats?.totalRevenue?.toLocaleString() || 0} грн`, 
      color: '#4ADE80' 
    },
    { 
      label: 'Замовлення', 
      value: stats?.ordersCount || 0, 
      color: '#818CF8' 
    },
    { 
      label: 'Нові клієнти', 
      value: stats?.customersCount || 0, 
      color: '#FB923C' 
    },
    { 
      label: 'Середній чек', 
      value: `${stats?.averageCheck?.toLocaleString() || 0} грн`, 
      color: '#2DD4BF' 
    }
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      {cards.map((card, index) => (
        <div key={index} style={analyticsStyles.card}>
          <p style={analyticsStyles.cardLabel}>{card.label}</p>
          <h2 style={{ 
            margin: 0, 
            color: card.color, 
            fontSize: '28px', 
            fontWeight: 'bold' 
          }}>
            {loading ? '...' : card.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;