import React, { useState } from 'react';

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
    <div className="mt-4">
      <h4 className="sto-text-muted mb-2">Історія контактів</h4>
      <input
        className="sto-input"
        placeholder="Нотатка дзвінка + Enter..."
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={add}
      />
      <div className="overflow-auto mt-2" style={{ maxHeight: '150px' }}>
        {notes.map(n => (
          <div key={n.id} className="sto-history-item">
            <small className="sto-text-accent fw-bold">{n.date}</small>
            <div style={{ color: '#E2E8F0' }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
