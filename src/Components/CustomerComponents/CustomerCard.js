import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CustomerCard = ({ customer, onClick }) => {
  // Динамічний стиль: золотиста рамка для VIP
  const cardStyle = customer.isVip 
    ? { ...customerStyles.card, border: '1px solid #fbbf24', position: 'relative' }
    : customerStyles.card;

  return (
    <div 
      style={cardStyle} 
      // ВАЖЛИВО: Викликаємо функцію і передаємо ID клієнта
      onClick={() => onClick(customer.id)}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {customer.isVip && (
        <div style={{ 
          position: 'absolute', top: '-10px', right: '10px', 
          background: '#fbbf24', color: '#fff', padding: '2px 8px', 
          borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' 
        }}>
          VIP
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{customer.name}</h3>
          <div style={{ fontSize: '14px', color: '#64748b' }}>{customer.phone}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>{customer.totalSpent} грн</div>
          <small style={{ color: '#94a3b8' }}>{customer.source}</small>
        </div>
      </div>

      <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
        {customer.cars && customer.cars.map((car, idx) => (
          <span key={idx} style={{ 
            fontSize: '12px', 
            background: '#0F172A', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            border: '1px solid #334155',
            color: '#F1F5F9'
          }}>
            {car.plate}
          </span>
        ))}
      </div>
    </div>
  );
};