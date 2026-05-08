import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CustomerStats = ({ customer, onUpdateNotes }) => {
  return (
    <div style={{ backgroundColor: '#1E293B', padding: '15px', borderRadius: '16px' }}>
      <h4 style={{ marginBottom: '15px', color: '#F1F5F9', borderBottom: '1px solid #334155', paddingBottom: '5px' }}>
        Деталі та Нотатки
      </h4>
      
      <div style={{ marginBottom: '15px' }}>
        <small style={{ color: '#94A3B8', display: 'block', marginBottom: '5px' }}>Контактний телефон:</small>
        <b style={{ fontSize: '16px', color: '#F1F5F9' }}>{customer.phone}</b>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <small style={{ color: '#94A3B8', display: 'block', marginBottom: '5px' }}>Особливі примітки майстра:</small>
        <textarea 
          defaultValue={customer.notes} 
          onBlur={(e) => onUpdateNotes(customer.id, e.target.value)}
          style={{ 
            ...customerStyles.input, 
            width: '100%', 
            height: '100px', 
            resize: 'none',
            backgroundColor: '#0F172A',
            color: '#F1F5F9'
          }}
          placeholder="Клієнт просить ставити тільки оригінальні запчастини..."
        />
      </div>

      <div style={{ 
        padding: '20px', 
        background: '#0F172A', 
        borderRadius: '16px',
        border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94A3B8', fontWeight: '500' }}>Всього витрачено:</span>
          <b style={{ color: '#818CF8', fontSize: '20px' }}>{customer.totalSpent} грн</b>
        </div>
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #334155' }}>
          <small style={{ color: '#64748b' }}>Джерело залучення: <b style={{color: '#F1F5F9'}}>{customer.source}</b></small>
        </div>
      </div>
    </div>
  );
};