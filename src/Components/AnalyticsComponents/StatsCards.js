import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';

export const StatsCards = () => {
  const { stats, loading, timeRange } = useAnalytics();

  const getPeriodLabel = () => {
    switch (timeRange) {
      case 'day': return '(день)';
      case 'week': return '(тиждень)';
      case 'month': return '(місяць)';
      default: return '';
    }
  };

  const cards = [
    { label: `Прибуток ${getPeriodLabel()}`, value: `${stats?.totalRevenue?.toLocaleString() || 0} грн`, color: 'var(--sto-success)' },
    { label: 'Замовлення', value: stats?.ordersCount || 0, color: 'var(--sto-accent)' },
    { label: 'Нові клієнти', value: stats?.customersCount || 0, color: '#FB923C' },
    { label: 'Середній чек', value: `${stats?.averageCheck?.toLocaleString() || 0} грн`, color: '#2DD4BF' },
  ];

  return (
    <div
      className="d-grid mb-4"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
      }}
    >
      {cards.map((card, index) => (
        <div key={index} className="sto-card sto-card-sm">
          <p className="sto-text-muted m-0 mb-2 small fw-semibold">{card.label}</p>
          <h2 className="m-0 fw-bold" style={{ color: card.color, fontSize: '28px' }}>
            {loading ? '...' : card.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
