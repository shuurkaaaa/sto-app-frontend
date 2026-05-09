import React from 'react';

export const QuickBookingModal = ({ isOpen, onClose, customerName, customerPhone }) => {
  if (!isOpen) return null;

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
        <h3 className="text-light mb-3">Швидкий запис</h3>

        <div className="sto-form-group">
          <label className="sto-label">Клієнт</label>
          <div className="rounded-3 p-3 border" style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}>
            <b className="text-light">{customerName}</b> <span className="sto-text-muted">({customerPhone})</span>
          </div>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Дата та час</label>
          <input type="datetime-local" className="sto-input" defaultValue="2026-03-02T10:00" />
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Послуга</label>
          <select className="sto-select">
            <option>Комп'ютерна діагностика</option>
            <option>Технічне обслуговування (ТО)</option>
            <option>Ремонт ходової</option>
            <option>Шиномонтаж</option>
          </select>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button onClick={onClose} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
          <button
            onClick={() => { alert('Запис додано в календар!'); onClose(); }}
            className="sto-btn sto-btn-primary flex-grow-1"
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};
