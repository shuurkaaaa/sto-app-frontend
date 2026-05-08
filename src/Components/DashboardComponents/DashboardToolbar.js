import React from 'react';

export const DashboardToolbar = ({ filter, onFilterChange, onAdd, showArchive, onToggleArchive }) => {
  
  const buttonBaseStyle = {
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select 
          value={filter} 
          onChange={(e) => onFilterChange(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '12px',
            border: '1px solid #334155',
            background: '#1E293B',
            color: '#F1F5F9',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="Всі">Всі статуси</option>
          <option value="Очікує">Очікує</option>
          <option value="В роботі">В роботі</option>
          <option value="Готово">Готово</option>
        </select>

        <button 
          onClick={() => onToggleArchive(!showArchive)}
          style={{
            ...buttonBaseStyle,
            background: showArchive ? '#818CF8' : '#334155',
            color: '#F1F5F9',
          }}
        >
          {showArchive ? 'Активні замовлення' : 'Архів'}
        </button>
      </div>

      <button 
        onClick={onAdd}
        style={{
          ...buttonBaseStyle,
          background: '#818CF8',
          color: '#FFFFFF',
        }}
      >
        + Новий заїзд
      </button>
    </div>
  );
};