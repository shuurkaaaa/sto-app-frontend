import React, { useState } from 'react';

export const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', carBrand: '', carModel: '', plate: '', vin: '', source: 'Прямий візит',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    let tempErrors = {};
    const nameRegex = /^[А-Яа-яЄєІіЇїҐґA-Za-z'-]+\s+[А-Яа-яЄєІіЇїҐґA-Za-z'-]+/;
    if (!nameRegex.test(formData.name.trim())) tempErrors.name = "Введіть Ім'я та Прізвище";
    const phoneRegex = /^\+380\d{9}$/;
    if (!phoneRegex.test(formData.phone)) tempErrors.phone = 'Формат: +380XXXXXXXXX';
    if (formData.carBrand.trim().length < 2) tempErrors.carBrand = 'Марка?';
    if (formData.carModel.trim().length < 1) tempErrors.carModel = 'Модель?';
    const plateRegex = /^[A-Z]{2}\s?\d{4}\s?[A-Z]{2}$/i;
    if (!plateRegex.test(formData.plate.trim())) tempErrors.plate = 'Формат: AA 1234 AA';
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
        car: { brand: formData.carBrand, model: formData.carModel, plate: formData.plate.toUpperCase(), vin: formData.vin || '—' },
        totalSpent: 0,
        notes: '',
        lastVisit: 'Новий',
      });
      setFormData({ name: '', phone: '', carBrand: '', carModel: '', plate: '', vin: '', source: 'Прямий візит' });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal sto-modal-lg">
        <h2 className="mb-3" style={{ color: '#F8FAFC' }}>Нова реєстрація клієнта</h2>
        <form onSubmit={handleSubmit}>
          <div className="sto-form-group">
            <label className="sto-text-muted small">ПІБ Клієнта</label>
            <input
              className={`sto-input ${errors.name ? 'sto-input--error' : ''}`}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className="sto-text-danger" style={{ fontSize: '10px' }}>{errors.name}</span>}
          </div>

          <div className="d-grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sto-form-group">
              <label className="sto-text-muted small">Телефон</label>
              <input
                className={`sto-input ${errors.phone ? 'sto-input--error' : ''}`}
                placeholder="+380..."
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <span className="sto-text-danger" style={{ fontSize: '10px' }}>{errors.phone}</span>}
            </div>
            <div className="sto-form-group">
              <label className="sto-text-muted small">Звідки дізналися?</label>
              <select className="sto-select" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                <option>Прямий візит</option>
                <option>Instagram</option>
                <option>Google Maps</option>
                <option>Реклама</option>
              </select>
            </div>
          </div>

          <div className="d-grid gap-2 mt-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="sto-form-group">
              <label className="sto-text-muted small">Марка</label>
              <input className={`sto-input ${errors.carBrand ? 'sto-input--error' : ''}`} value={formData.carBrand} onChange={e => setFormData({ ...formData, carBrand: e.target.value })} />
            </div>
            <div className="sto-form-group">
              <label className="sto-text-muted small">Модель</label>
              <input className={`sto-input ${errors.carModel ? 'sto-input--error' : ''}`} value={formData.carModel} onChange={e => setFormData({ ...formData, carModel: e.target.value })} />
            </div>
            <div className="sto-form-group">
              <label className="sto-text-muted small">Держ. номер</label>
              <input className={`sto-input ${errors.plate ? 'sto-input--error' : ''}`} placeholder="AA 1234 AA" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} />
            </div>
          </div>

          <div className="sto-form-group mt-2">
            <label className="sto-text-muted small">VIN-код (необов'язково)</label>
            <input className="sto-input" placeholder="Введіть VIN-код автомобіля..." value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} />
          </div>

          <div className="d-flex gap-3 mt-4">
            <button type="submit" className="sto-btn sto-btn-primary flex-grow-1">Зареєструвати</button>
            <button type="button" onClick={onClose} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  );
};
