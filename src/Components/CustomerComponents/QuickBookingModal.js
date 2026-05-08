import React from 'react';
import { customerStyles } from './CustomerStyles';

export const QuickBookingModal = ({ isOpen, onClose, customerName, customerPhone }) => {
  if (!isOpen) return null;

  return (
    <div style={customerStyles.modalOverlay} onClick={onClose}>
      <div style={{ ...customerStyles.modalContent, width: '450px' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: '20px', color: '#F1F5F9' }}>Швидкий запис</h3>
        
        <div style={customerStyles.formGroup}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94A3B8' }}>Клієнт</label>
          <div style={{ padding: '12px', background: '#0F172A', borderRadius: '10px', fontSize: '14px', border: '1px solid #334155' }}>
            <b style={{ color: '#F1F5F9' }}>{customerName}</b> <span style={{ color: '#94A3B8' }}>({customerPhone})</span>
          </div>
        </div>

        <div style={customerStyles.formGroup}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94A3B8' }}>Дата та час</label>
          <input type="datetime-local" style={customerStyles.input} defaultValue="2026-03-02T10:00" />
        </div>

        <div style={customerStyles.formGroup}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94A3B8' }}>Послуга</label>
          <select style={customerStyles.input}>
            <option>Комп'ютерна діагностика</option>
            <option>Технічне обслуговування (ТО)</option>
            <option>Ремонт ходової</option>
            <option>Шиномонтаж</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#334155', color: '#F1F5F9', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            Скасувати
          </button>
          <button 
            onClick={() => { alert('Запис додано в календар!'); onClose(); }} 
            style={{ flex: 1, padding: '12px', background: '#818CF8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};