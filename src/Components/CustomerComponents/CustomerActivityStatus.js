import React from 'react';

export const CustomerActivityStatus = ({ lastVisit }) => {
  const getStatus = (dateStr) => {
    if (!dateStr) return { label: 'Новий', cls: 'sto-badge-active' };
    const diffMonths = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths <= 3) return { label: 'Активний', cls: 'sto-badge-active' };
    if (diffMonths <= 7) return { label: 'Сплячий', cls: 'sto-badge-sleeping' };
    return { label: 'Втрачений', cls: 'sto-badge-lost' };
  };

  const status = getStatus(lastVisit);

  return <div className={`sto-badge ${status.cls} mb-2`}>{status.label}</div>;
};
