import React, { useState } from 'react';

export const InventoryActions = ({ inventoryItem, operationMode, onClose, onConfirm }) => {
  const [amountInput, setAmountInput] = useState(1);
  const [noteInput, setNoteInput] = useState('');

  const handleUpdate = () => {
    const finalAmount = operationMode === 'sell' ? -Number(amountInput) : Number(amountInput);
    onConfirm(finalAmount, noteInput);
  };

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal" style={{ maxWidth: '350px' }}>
        <div className="d-flex justify-content-between mb-3">
          <h3 className={`m-0 ${operationMode === 'sell' ? 'sto-text-danger' : 'sto-text-success'}`}>
            {operationMode === 'sell' ? 'Списання товару' : 'Додавання на склад'}
          </h3>
          <button onClick={onClose} className="text-light" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        <p className="text-light mb-3 small">Товар: <b>{inventoryItem.name}</b></p>

        <div className="sto-form-group">
          <label className="sto-label">Кількість:</label>
          <input
            type="number"
            min="1"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="sto-input"
          />
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Примітка (номер авто / коментар):</label>
          <textarea
            placeholder="Наприклад: Audi A6 AA1234BB"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            className="sto-input sto-textarea"
            style={{ height: '80px', resize: 'none' }}
          />
        </div>

        <div className="d-flex gap-2">
          <button onClick={onClose} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
          <button
            onClick={handleUpdate}
            className="sto-btn fw-bold flex-grow-1"
            style={{
              background: operationMode === 'sell' ? '#F87171' : '#4ADE80',
              color: '#0F172A',
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};
