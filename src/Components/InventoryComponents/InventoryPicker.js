import React from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

export const InventoryPicker = ({ selectedParts, onAddPart, onRemovePart }) => {
  const { inventoryItems } = useInventoryContext();

  return (
    <div>
      <label className="sto-label">СКЛАД ЗАПЧАСТИН</label>
      <select
        className="sto-select mb-3"
        onChange={(e) => {
          if (e.target.value) onAddPart(Number(e.target.value));
          e.target.value = '';
        }}
        defaultValue=""
      >
        <option value="" disabled>+ Додати товар зі складу...</option>
        {inventoryItems.map(item => (
          <option key={item.id} value={item.id} disabled={item.current <= 0}>
            {item.name} ({item.current} шт) — {item.price} грн
          </option>
        ))}
      </select>

      <div
        className="rounded-3 p-3 border"
        style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)', minHeight: '100px' }}
      >
        {selectedParts.length === 0 && (
          <p className="sto-text-muted small text-center mt-4">Нічого не вибрано</p>
        )}
        {selectedParts.map((part, idx) => (
          <div
            key={idx}
            className="d-flex justify-content-between p-2 mb-1 rounded-2 border text-light small"
            style={{ background: 'var(--sto-bg-2)', borderColor: 'var(--sto-border)' }}
          >
            <span>{part.name}</span>
            <div className="d-flex gap-2 align-items-center">
              <span className="fw-bold">{part.price} грн</span>
              <button
                onClick={() => onRemovePart(idx)}
                className="border-0 rounded-2"
                style={{ background: '#450a0a', color: '#F87171', width: '22px', height: '22px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
