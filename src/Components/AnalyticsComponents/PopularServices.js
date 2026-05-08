import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';
import { analyticsStyles } from './AnalyticsStyles';

export const PopularServices = () => {
  const { popularServices, loading } = useAnalytics();

  if (loading) return <p style={{ color: '#94A3B8' }}>Завантаження...</p>;

  return (
    <div>
      {(popularServices || []).map((service, index) => (
        <div key={index} style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F1F5F9', fontSize: '14px' }}>
            <span>{service.name}</span>
            <span style={{ color: '#94A3B8' }}>{service.count} разів</span>
          </div>
          <div style={analyticsStyles.progressBar}>
            <div style={analyticsStyles.progressFill((service.count / (popularServices[0]?.count || 1)) * 100)} />
          </div>
        </div>
      ))}
    </div>
  );
};