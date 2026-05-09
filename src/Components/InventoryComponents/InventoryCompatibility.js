import React from 'react';

export const InventoryCompatibility = ({ inventoryItem, onUpdateCompatibility }) => {
  const compatibleVehicles = inventoryItem.compatibility || [];
  return (
    <div className="d-flex gap-1 flex-wrap">
      {compatibleVehicles.length > 0 ? (
        compatibleVehicles.map((v, i) => <span key={i} className="sto-compat-tag">{v}</span>)
      ) : (
        <span className="sto-text-muted small">Не вказано</span>
      )}
      <button
        onClick={() => {
          const v = prompt('Введіть модель автомобіля:');
          if (v) onUpdateCompatibility([...compatibleVehicles, v]);
        }}
        className="sto-btn-dashed"
        style={{ fontSize: '10px', padding: '4px 8px' }}
      >
        +
      </button>
    </div>
  );
};
