import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CustomerToolbar = ({ value, onChange, showArchive, onToggleArchive }) => (
  <div style={{ marginBottom: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
    <input 
      type="text"
      placeholder="Пошук клієнта за іменем, телефоном або номером авто..."
      style={{ ...customerStyles.searchBar, flex: 1, marginBottom: 0 }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    
    {onToggleArchive && (
      <button 
        onClick={() => onToggleArchive(!showArchive)}
        style={{
          padding: '10px 20px',
          borderRadius: '12px',
          border: '1px solid #334155',
          background: showArchive ? '#475569' : '#1E293B',
          color: '#F1F5F9',
          cursor: 'pointer',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}
      >
        {showArchive ? 'Показати базу' : 'Архів клієнтів'}
      </button>
    )}
  </div>
);