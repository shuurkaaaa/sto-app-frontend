import React, { useState } from 'react';
import { customerStyles } from './CustomerStyles';

export const CommunicationHistory = () => {
  const [notes, setNotes] = useState([{ id: 1, text: 'Реєстрація в системі', date: '02.03.2026' }]);
  const [val, setVal] = useState('');

  const add = (e) => {
    if (e.key === 'Enter' && val.trim()) {
      setNotes([{ id: Date.now(), text: val, date: new Date().toLocaleDateString() }, ...notes]);
      setVal('');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ marginBottom: '10px', color: '#94A3B8' }}>Історія контактів</h4>
      <input 
        style={customerStyles.input} 
        placeholder="Нотатка дзвінка + Enter..." 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        onKeyDown={add} 
      />
      <div style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '10px' }}>
        {notes.map(n => (
          <div key={n.id} style={customerStyles.historyItem}>
            <small style={{ color: '#818CF8', fontWeight: 'bold' }}>{n.date}</small>
            <div style={{ color: '#E2E8F0' }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};