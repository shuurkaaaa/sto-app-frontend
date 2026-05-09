import React from 'react';

export const MaintenanceAlert = ({ lastVisit }) => {
  if (!lastVisit) return null;
  const lastDate = new Date(lastVisit);
  const today = new Date();
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (isNaN(diffDays) || diffDays < 180) return null;

  return (
    <div className="sto-maintenance-alert">
      <div>
        <h4 className="m-0 fw-bold" style={{ color: '#FECACA', fontSize: '14px' }}>
          Час на планове ТО!
        </h4>
        <p className="m-0 small" style={{ color: '#FCA5A5' }}>
          Останній візит був {diffDays} днів тому. Рекомендується заміна мастила.
        </p>
      </div>
    </div>
  );
};
