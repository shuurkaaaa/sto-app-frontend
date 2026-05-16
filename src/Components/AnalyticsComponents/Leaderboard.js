import React from 'react';
import { useAnalytics } from '../../Context/AnalyticsContext';

export const Leaderboard = () => {
  const { topWorkers, loading } = useAnalytics();

  if (loading) return <p className="sto-text-muted">Завантаження...</p>;

  return (
    <div>
      {(topWorkers || []).map((worker, index) => (
        <div
          key={worker.id || index}
          className={`sto-leader-item ${index === 0 ? 'sto-leader-item--first' : ''}`}
        >
          <div className="d-flex align-items-center gap-3">
            <span className="fw-bold sto-text-muted">#{index + 1}</span>
            <div>
              <div className="fw-semibold text-light small">{worker.name}</div>
              <div className="sto-text-muted" style={{ fontSize: '12px' }}>
                {worker.role}
                {worker.commissionPercent ? ` • ${worker.commissionPercent}%` : ''}
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="fw-bold sto-text-success">
              {(worker.earnings ?? worker.totalEarned ?? 0).toLocaleString('uk-UA')} грн
            </div>
            {worker.totalServiced !== undefined && (
              <div className="sto-text-muted" style={{ fontSize: '11px' }}>
                з {worker.totalServiced.toLocaleString('uk-UA')} грн
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
