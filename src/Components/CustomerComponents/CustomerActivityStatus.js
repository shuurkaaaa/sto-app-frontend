import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CustomerActivityStatus = ({ lastVisit }) => {
  const getStatus = (dateStr) => {
    if (!dateStr) return { label: 'Новий', style: customerStyles.active };
    const diffMonths = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths <= 3) return { label: 'Активний', style: customerStyles.active };
    if (diffMonths <= 7) return { label: 'Сплячий', style: customerStyles.sleeping };
    return { label: 'Втрачений', style: customerStyles.lost };
  };

  const status = getStatus(lastVisit);

  return (
    <div style={{ ...customerStyles.statusBadge, ...status.style }}>
      {status.label}
    </div>
  );
};