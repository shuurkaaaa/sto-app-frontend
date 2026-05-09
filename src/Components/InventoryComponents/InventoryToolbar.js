import React from 'react';

export const InventoryToolbar = ({ searchTerm, onSearchChange }) => (
  <div className="mb-3">
    <input
      type="text"
      placeholder="Пошук за назвою або артикулом (SKU)..."
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
      className="sto-input-search"
    />
  </div>
);
