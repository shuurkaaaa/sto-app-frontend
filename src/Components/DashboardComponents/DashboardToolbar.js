import React from 'react';

export const DashboardToolbar = ({ filter, onFilterChange, onAdd, showArchive, onToggleArchive }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex gap-2 align-items-center">
        {!showArchive && (
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="sto-select"
            style={{ width: 'auto' }}
          >
            <option value="Всі">Всі статуси</option>
            <option value="PENDING">Очікує</option>
            <option value="IN_WORK">В роботі</option>
            <option value="READY">Готово</option>
          </select>
        )}

        <button
          onClick={() => onToggleArchive(!showArchive)}
          className={`sto-btn ${showArchive ? 'sto-btn-primary' : 'sto-btn-secondary'}`}
        >
          {showArchive ? 'Активні замовлення' : 'Архів'}
        </button>
      </div>

      <button onClick={onAdd} className="sto-btn sto-btn-primary">
        + Новий заїзд
      </button>
    </div>
  );
};
