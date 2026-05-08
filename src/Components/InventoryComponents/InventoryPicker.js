import React from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

export const InventoryPicker = ({ selectedParts, onAddPart, onRemovePart }) => {
  const { inventoryItems } = useInventoryContext();

  const inventoryPickerStyles = {
    label: { display: 'block', fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase' },
    select: { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '15px', outline: 'none', backgroundColor: '#1E293B', color: '#F1F5F9' },
    list: { background: '#0F172A', padding: '12px', borderRadius: '12px', border: '1px solid #334155', minHeight: '100px' },
    empty: { color: '#94A3B8', fontSize: '12px', textAlign: 'center', marginTop: '35px' },
    item: { display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#1E293B', borderRadius: '8px', marginBottom: '6px', fontSize: '13px', border: '1px solid #334155', color: '#F1F5F9' },
    remove: { background: '#450a0a', color: '#F87171', border: 'none', borderRadius: '5px', width: '22px', height: '22px', cursor: 'pointer' }
  };

  return (
    <div>
      <label style={inventoryPickerStyles.label}>СКЛАД ЗАПЧАСТИН</label>
      <select 
        style={inventoryPickerStyles.select} 
        onChange={(event) => {
          if(event.target.value) {
            onAddPart(Number(event.target.value));
          }
          event.target.value = "";
        }}
        defaultValue=""
      >
        <option value="" disabled>+ Додати товар зі складу...</option>
        {inventoryItems.map(inventoryItem => (
          <option key={inventoryItem.id} value={inventoryItem.id} disabled={inventoryItem.current <= 0}>
            {inventoryItem.name} ({inventoryItem.current} шт) — {inventoryItem.price} грн
          </option>
        ))}
      </select>

      <div style={inventoryPickerStyles.list}>
        {selectedParts.length === 0 && <p style={inventoryPickerStyles.empty}>Нічого не вибрано</p>}
        {selectedParts.map((part, index) => (
          <div key={index} style={inventoryPickerStyles.item}>
            <span>{part.name}</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>{part.price} грн</span>
              <button onClick={() => onRemovePart(index)} style={inventoryPickerStyles.remove}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};