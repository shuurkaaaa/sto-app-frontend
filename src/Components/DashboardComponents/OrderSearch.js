import React from 'react';

export const OrderSearch = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-3 d-flex align-items-center gap-2">
      <input
        type="text"
        placeholder="Пошук за авто, ПІБ або номером телефону..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sto-input-search w-100"
      />
    </div>
  );
};
