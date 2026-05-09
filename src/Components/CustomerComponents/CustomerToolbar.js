import React from 'react';

export const CustomerToolbar = ({ value, onChange, showArchive, onToggleArchive }) => (
  <div className="d-flex gap-3 align-items-center mb-4">
    <input
      type="text"
      placeholder="Пошук клієнта за іменем, телефоном або номером авто..."
      className="sto-input-search flex-grow-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />

    {onToggleArchive && (
      <button
        onClick={() => onToggleArchive(!showArchive)}
        className="sto-btn fw-semibold text-light text-nowrap border"
        style={{ background: showArchive ? 'var(--sto-border-2)' : 'var(--sto-bg-2)', borderColor: 'var(--sto-border)' }}
      >
        {showArchive ? 'Показати базу' : 'Архів клієнтів'}
      </button>
    )}
  </div>
);
