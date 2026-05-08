import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CustomerHeader = ({ onAddClick }) => (
  <div style={customerStyles.header}>
    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>
      Клієнтська база
    </h1>
    <button 
      onClick={onAddClick}
      style={{ 
        padding: '12px 24px', 
        backgroundColor: '#818CF8', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
        transition: 'transform 0.1s active'
      }}
    >
      + НОВИЙ КЛІЄНТ
    </button>
  </div>
);