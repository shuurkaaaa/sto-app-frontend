import React from 'react';

export const MasterWorkload = ({ allOrders, workers }) => {
  return (
    <div className="sto-card-sm mb-3">
      <div className="sto-text-muted fw-bold mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
        МОНІТОРИНГ ЗАВАНТАЖЕНОСТІ
      </div>
      <div className="d-flex flex-wrap gap-2">
        {workers.map(worker => {
          const activeCount = allOrders.filter(
            o => o.masterId === worker.id && o.status === 'IN_WORK'
          ).length;

          let statusClass = 'sto-text-success';
          if (activeCount >= 2) statusClass = 'sto-text-warning';
          if (activeCount >= 4) statusClass = 'sto-text-danger';

          return (
            <div
              key={worker.id}
              className="d-flex align-items-center gap-2 px-2 py-1 rounded-3 border"
              style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}
            >
              <span
                className={statusClass}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}
              />
              <span className="text-light small fw-medium">
                {worker.name}: <b className={statusClass}>{activeCount}</b>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
