import React from 'react';

export const InventoryCompatibility = ({ inventoryItem, onUpdateCompatibility }) => {
  const compatibleVehicles = inventoryItem.compatibility || [];
  
  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
      {compatibleVehicles.length > 0 ? (
        compatibleVehicles.map((vehicle, index) => (
          <span key={index} style={{ fontSize: '11px', background: '#1E293B', color: '#818CF8', padding: '4px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
            {vehicle}
          </span>
        ))
      ) : (
        <span style={{ color: '#94A3B8', fontSize: '12px' }}>Не вказано</span>
      )}
      <button 
        onClick={() => {
          const vehicle = prompt("Введіть модель автомобіля:");
          if(vehicle) onUpdateCompatibility([...compatibleVehicles, vehicle]);
        }}
        style={{ border: '1px dashed #334155', background: 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', color: '#94A3B8', padding: '4px 8px' }}
      >
        +
      </button>
    </div>
  );
};