import React from 'react';
import { dashboardStyles } from './DashboardStyles';

export const OrderSearch = ({ searchTerm, onSearchChange, onOpenAddModal }) => {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          placeholder="Пошук за авто, ПІБ або номером телефону..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={dashboardStyles.searchField}
        />
      </div>
    </div>
  );
};