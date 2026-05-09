import React from 'react';

export const OrderExtraFields = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="mt-2 pt-3" style={{ borderTop: '1px solid var(--sto-border)' }}>
      <div className="d-flex gap-2 mb-3">
        <div className="flex-grow-1">
          <p className="sto-label">ОПЛАТА:</p>
          <select
            className="sto-select"
            value={formData.payment || ''}
            onChange={e => handleChange('payment', e.target.value)}
          >
            <option value="Готівка">Готівка</option>
            <option value="Карта">Карта</option>
            <option value="Рахунок">Рахунок</option>
          </select>
        </div>

        <div className="flex-grow-1">
          <p className="sto-label">ГОТОВНІСТЬ:</p>
          <input
            type="datetime-local"
            className="sto-input"
            value={formData.deadline || ''}
            onChange={e => handleChange('deadline', e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="sto-label">КОМЕНТАР МАЙСТРУ:</p>
        <textarea
          className="sto-input sto-textarea"
          style={{ height: '80px', resize: 'none' }}
          placeholder="Опишіть зауваження, скарги або важливі деталі..."
          value={formData.comment || ''}
          onChange={e => handleChange('comment', e.target.value)}
        />
      </div>
    </div>
  );
};
