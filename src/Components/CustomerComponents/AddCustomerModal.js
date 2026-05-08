import React, { useState } from 'react';
import { customerStyles } from './CustomerStyles';

export const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    carBrand: '', 
    carModel: '', 
    plate: '', 
    source: 'Прямий візит' 
  });
  
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    let tempErrors = {};
    
    const nameRegex = /^[А-Яа-яЄєІіЇїҐґA-Za-z'-]+\s+[А-Яа-яЄєІіЇїҐґA-Za-z'-]+/;
    if (!nameRegex.test(formData.name.trim())) {
      tempErrors.name = "Введіть Ім'я та Прізвище";
    }

    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = "Формат: +380XXXXXXXXX";
    }

    if (formData.carBrand.trim().length < 2) tempErrors.carBrand = "Марка?";
    if (formData.carModel.trim().length < 1) tempErrors.carModel = "Модель?";

    const plateRegex = /^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/i;
    if (!plateRegex.test(formData.plate.trim())) {
      tempErrors.plate = "Формат: AA 1234 AA";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onAdd({
        name: formData.name,
        phone: formData.phone,
        source: formData.source,
        car: { 
          brand: formData.carBrand, 
          model: formData.carModel,
          plate: formData.plate.toUpperCase(), 
          vin: '—' 
        },
        totalSpent: 0,
        notes: '',
        lastVisit: 'Новий'
      });
      
      setFormData({ name: '', phone: '', carBrand: '', carModel: '', plate: '', source: 'Прямий візит' });
      setErrors({});
      onClose();
    }
  };

  const errorStyle = { color: '#ef4444', fontSize: '10px', marginTop: '2px', display: 'block' };

  return (
    <div style={customerStyles.modalOverlay}>
      <div style={customerStyles.modalContent}>
        <h2 style={{ marginBottom: '20px', color: '#F8FAFC' }}>Нова реєстрація клієнта</h2>
        <form onSubmit={handleSubmit}>
          
          <div style={customerStyles.formGroup}>
            <label style={{ color: '#94A3B8', fontSize: '14px' }}>ПІБ Клієнта</label>
            <input 
              style={{...customerStyles.input, borderColor: errors.name ? '#ef4444' : 'transparent'}} 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            {errors.name && <span style={errorStyle}>{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={customerStyles.formGroup}>
              <label style={{ color: '#94A3B8', fontSize: '14px' }}>Телефон</label>
              <input 
                style={{...customerStyles.input, borderColor: errors.phone ? '#ef4444' : 'transparent'}} 
                placeholder="+380..."
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
              {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
            </div>
            <div style={customerStyles.formGroup}>
              <label style={{ color: '#94A3B8', fontSize: '14px' }}>Звідки дізналися?</label>
              <select style={customerStyles.input} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                <option>Прямий візит</option>
                <option>Instagram</option>
                <option>Google Maps</option>
                <option>Реклама</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div style={customerStyles.formGroup}>
              <label style={{ color: '#94A3B8', fontSize: '14px' }}>Марка</label>
              <input style={{...customerStyles.input, borderColor: errors.carBrand ? '#ef4444' : 'transparent'}} value={formData.carBrand} onChange={e => setFormData({...formData, carBrand: e.target.value})} />
            </div>
            <div style={customerStyles.formGroup}>
              <label style={{ color: '#94A3B8', fontSize: '14px' }}>Модель</label>
              <input style={{...customerStyles.input, borderColor: errors.carModel ? '#ef4444' : 'transparent'}} value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} />
            </div>
            <div style={customerStyles.formGroup}>
              <label style={{ color: '#94A3B8', fontSize: '14px' }}>Держ. номер</label>
              <input style={{...customerStyles.input, borderColor: errors.plate ? '#ef4444' : 'transparent'}} placeholder="AA 1234 AA" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
            </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
            <button type="submit" style={{ flex: 1, padding: '14px', background: '#818CF8', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Зареєструвати</button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', background: '#334155', color: '#F1F5F9', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
};