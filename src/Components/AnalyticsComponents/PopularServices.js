import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';

export const PopularServices = () => {
  const { popularServices, loading } = useAnalytics();

  if (loading) return <p className="sto-text-muted">Завантаження...</p>;

  const max = popularServices?.[0]?.count || 1;

  return (
    <div>
      {(popularServices || []).map((service, index) => (
        <div key={index} className="mb-3">
          <div className="d-flex justify-content-between text-light small">
            <span>{service.name}</span>
            <span className="sto-text-muted">{service.count} разів</span>
          </div>
          <div className="sto-progress">
            <div className="sto-progress-fill" style={{ width: `${(service.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
