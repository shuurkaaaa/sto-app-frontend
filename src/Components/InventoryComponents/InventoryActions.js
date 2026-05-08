import React, { useState } from 'react';
import { inventoryStyles } from './InventoryStyles';

export const InventoryActions = ({ inventoryItem, operationMode, onClose, onConfirm }) => {
  const [amountInput, setAmountInput] = useState(1);
  const [noteInput, setNoteInput] = useState('');

  const handleUpdate = () => {
    // Якщо списуємо (sell), робимо число від'ємним
    const finalAmount = operationMode === 'sell' ? -Number(amountInput) : Number(amountInput);
    onConfirm(finalAmount, noteInput);
  };

  return (
    <div style={inventoryStyles.modalOverlay}>
      <div style={{ ...inventoryStyles.modalContent, maxWidth: '350px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: operationMode === 'sell' ? '#F87171' : '#4ADE80' }}>
            {operationMode === 'sell' ? 'Списання товару' : 'Додавання на склад'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#F1F5F9' }}>×</button>
        </div>

        <p style={{ fontSize: '14px', marginBottom: '15px', color: '#F1F5F9' }}>
            Товар: <b>{inventoryItem.name}</b>
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#94A3B8' }}>Кількість:</label>
          <input 
            type="number" 
            min="1"
            value={amountInput} 
            onChange={(event) => setAmountInput(event.target.value)}
            style={inventoryStyles.modalInput}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#94A3B8' }}>Примітка (номер авто / коментар):</label>
          <textarea 
            placeholder="Наприклад: Audi A6 AA1234BB"
            value={noteInput}
            onChange={(event) => setNoteInput(event.target.value)}
            style={{ ...inventoryStyles.modalInput, height: '80px', resize: 'none', padding: '10px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={inventoryStyles.purchaseButton}>Скасувати</button>
          <button 
            onClick={handleUpdate} 
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              border: 'none', 
              backgroundColor: operationMode === 'sell' ? '#F87171' : '#4ADE80', 
              color: '#0F172A',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
};