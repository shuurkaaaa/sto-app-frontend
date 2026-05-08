import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';
import { analyticsStyles } from './AnalyticsStyles';

export const Leaderboard = () => {
  const { topWorkers, loading } = useAnalytics();

  if (loading) return <p style={{ color: '#94A3B8' }}>Завантаження...</p>;

  return (
    <div>
      {(topWorkers || []).map((worker, index) => (
        <div key={worker.id || index} style={analyticsStyles.leaderItem(index === 0)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold', color: '#94A3B8' }}>#{index + 1}</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#F1F5F9' }}>{worker.name}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>{worker.role}</div>
            </div>
          </div>
          <div style={{ fontWeight: 'bold', color: '#4ADE80' }}>
            {worker.totalEarned?.toLocaleString() || 0} грн
          </div>
        </div>
      ))}
    </div>
  );
};