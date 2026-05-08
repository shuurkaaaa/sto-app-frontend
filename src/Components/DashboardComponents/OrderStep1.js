import React from 'react';
import { OrderExtraFields } from './OrderExtraFields';

export const OrderStep1 = ({ formData, setFormData, errors, setErrors, styles }) => {
  
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const getInputStyle = (fieldName) => {
    const hasError = !!errors[fieldName];
    if (typeof styles.input === 'function') {
      return styles.input(hasError);
    }
    return styles.input || {};
  };

  return (
    <div style={styles.stepContainer}>
      <div style={{ marginBottom: '12px' }}>
        <p style={styles.label}>КЛІЄНТ:</p>
        <input 
          style={getInputStyle('client')} 
          placeholder="Прізвище та Ім'я" 
          value={formData.client || ""}
          onChange={e => handleChange('client', e.target.value)} 
        />
        {errors.client && <span style={styles.errorText}>{errors.client}</span>}
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <p style={styles.label}>НОМЕР ТЕЛЕФОНУ:</p>
        <input 
          style={getInputStyle('phone')} 
          placeholder="0XX XXX XX XX" 
          value={formData.phone || ""}
          onChange={e => handleChange('phone', e.target.value)} 
        />
        {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>АВТОМОБІЛЬ:</p>
          <input 
            style={getInputStyle('car')} 
            placeholder="Марка та модель" 
            value={formData.car || ""}
            onChange={e => handleChange('car', e.target.value)} 
          />
          {errors.car && <span style={styles.errorTextSmall}>{errors.car}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.label}>ДЕРЖ. НОМЕР:</p>
          <input 
            style={getInputStyle('plate')} 
            placeholder="AA 0000 BB" 
            value={formData.plate || ""}
            onChange={e => handleChange('plate', e.target.value.toUpperCase())} 
          />
          {errors.plate && <span style={styles.errorTextSmall}>{errors.plate}</span>}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '5px' }}>
        <OrderExtraFields formData={formData} setFormData={setFormData} styles={styles} />
      </div>
    </div>
  );
};