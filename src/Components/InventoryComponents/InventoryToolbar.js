import React from 'react';

export const InventoryToolbar = ({ searchTerm, onSearchChange }) => (
  <div style={{ marginBottom: '20px' }}>
    <input
      type="text"
      placeholder="Пошук за назвою або артикулом (SKU)..."
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
      style={{
        width: '100%',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid #334155',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: '#1E293B',
        color: '#F1F5F9'
      }}
    />
  </div>
);