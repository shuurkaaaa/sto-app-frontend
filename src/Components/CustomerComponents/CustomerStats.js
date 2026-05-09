import React from 'react';

export const CustomerStats = ({ customer, onUpdateNotes }) => {
  return (
    <div className="rounded-4 p-3" style={{ background: 'var(--sto-bg-2)' }}>
      <h4 className="text-light mb-3 pb-2" style={{ borderBottom: '1px solid var(--sto-border)' }}>
        Деталі та Нотатки
      </h4>

      <div className="mb-3">
        <small className="sto-text-muted d-block mb-1">Контактний телефон:</small>
        <b className="text-light">{customer.phone}</b>
      </div>

      <div className="mb-4">
        <small className="sto-text-muted d-block mb-1">Особливі примітки майстра:</small>
        <textarea
          defaultValue={customer.notes}
          onBlur={(e) => onUpdateNotes(customer.id, e.target.value)}
          className="sto-input sto-textarea"
          style={{ height: '100px', resize: 'none' }}
          placeholder="Клієнт просить ставити тільки оригінальні запчастини..."
        />
      </div>

      <div className="rounded-4 p-3 border" style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <span className="sto-text-muted fw-medium">Всього витрачено:</span>
          <b className="sto-text-accent" style={{ fontSize: '20px' }}>{customer.totalSpent} грн</b>
        </div>
        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--sto-border)' }}>
          <small className="sto-text-dim">Джерело залучення: <b className="text-light">{customer.source}</b></small>
        </div>
      </div>
    </div>
  );
};
