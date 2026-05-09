import React from 'react';
import { OrderExtraFields } from './OrderExtraFields';

export const OrderStep1 = ({ formData, setFormData, errors, setErrors }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const inputCls = (field) => `sto-input ${errors[field] ? 'sto-input--error' : ''}`;

  return (
    <div>
      <div className="sto-form-group">
        <p className="sto-label">КЛІЄНТ:</p>
        <input
          className={inputCls('client')}
          placeholder="Прізвище та Ім'я"
          value={formData.client || ''}
          onChange={e => handleChange('client', e.target.value)}
        />
        {errors.client && <span className="sto-text-danger small">{errors.client}</span>}
      </div>

      <div className="sto-form-group">
        <p className="sto-label">НОМЕР ТЕЛЕФОНУ:</p>
        <input
          className={inputCls('phone')}
          placeholder="0XX XXX XX XX"
          value={formData.phone || ''}
          onChange={e => handleChange('phone', e.target.value)}
        />
        {errors.phone && <span className="sto-text-danger small">{errors.phone}</span>}
      </div>

      <div className="d-flex gap-2 mb-3">
        <div className="flex-grow-1">
          <p className="sto-label">АВТОМОБІЛЬ:</p>
          <input
            className={inputCls('car')}
            placeholder="Марка та модель"
            value={formData.car || ''}
            onChange={e => handleChange('car', e.target.value)}
          />
          {errors.car && <span className="sto-text-danger" style={{ fontSize: '10px' }}>{errors.car}</span>}
        </div>
        <div className="flex-grow-1">
          <p className="sto-label">ДЕРЖ. НОМЕР:</p>
          <input
            className={inputCls('plate')}
            placeholder="AA 0000 BB"
            value={formData.plate || ''}
            onChange={e => handleChange('plate', e.target.value.toUpperCase())}
          />
          {errors.plate && <span className="sto-text-danger" style={{ fontSize: '10px' }}>{errors.plate}</span>}
        </div>
      </div>

      <OrderExtraFields formData={formData} setFormData={setFormData} />
    </div>
  );
};
