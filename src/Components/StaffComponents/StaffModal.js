import React, { useState, useEffect } from 'react';
import { useWorkers } from '../../Context/WorkersContext';

export const StaffModal = ({ isOpen, onClose, onSave, worker }) => {
  const { categories } = useWorkers();
  const [formData, setFormData] = useState({ name: '', role: '', exp: '', category: '', commissionPercent: 10 });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (worker) {
        const workerCatName = worker.staffCategory?.name || '';
        setFormData({
          name: worker.name || '',
          role: worker.role || '',
          exp: worker.exp || '',
          category: workerCatName,
          commissionPercent: worker.commissionPercent ?? 10,
        });
      } else {
        const defaultCategory = categories.length > 0 ? categories[0].name : '';
        setFormData({ name: '', role: '', exp: '', category: defaultCategory, commissionPercent: 10 });
      }
      setErrors({});
    }
  }, [worker, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Введіть ПІБ майстра';
    if (!formData.role.trim()) newErrors.role = 'Вкажіть посаду (напр. Моторист)';
    if (!formData.category) newErrors.category = 'Оберіть спеціалізацію';
    const cp = Number(formData.commissionPercent);
    if (Number.isNaN(cp) || cp < 0 || cp > 100) newErrors.commissionPercent = 'Відсоток від 0 до 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const selectedCat = categories.find(c => c.name === formData.category);
    onSave({
      id: worker ? worker.id : null,
      name: formData.name.trim(),
      role: formData.role.trim(),
      exp: parseInt(formData.exp, 10) || 0,
      staffCategoryId: selectedCat ? selectedCat.id : null,
      commissionPercent: Number(formData.commissionPercent),
    });
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 5000 }}>
      <div className="sto-modal" style={{ maxWidth: '440px' }}>
        <h2 className="mt-0 mb-3 text-light" style={{ fontSize: '22px' }}>
          {worker ? 'Редагувати майстра' : ' Новий працівник'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="sto-label">ПІБ майстра *</label>
            <input
              className={`sto-input ${errors.name ? 'sto-input--error' : ''}`}
              placeholder="Прізвище та Ім'я"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className="sto-text-danger small d-block mt-1">{errors.name}</span>}
          </div>

          <div className="mb-3">
            <label className="sto-label">Посада *</label>
            <input
              className={`sto-input ${errors.role ? 'sto-input--error' : ''}`}
              placeholder="Наприклад: Моторист"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            />
            {errors.role && <span className="sto-text-danger small d-block mt-1">{errors.role}</span>}
          </div>

          <div className="mb-3">
            <label className="sto-label">Досвід роботи (повних років)</label>
            <input
              type="number"
              min="0"
              className="sto-input"
              placeholder="0"
              value={formData.exp}
              onChange={e => setFormData({ ...formData, exp: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="sto-label">Відсоток від ціни замовлення (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={`sto-input ${errors.commissionPercent ? 'sto-input--error' : ''}`}
              placeholder="10"
              value={formData.commissionPercent}
              onChange={e => setFormData({ ...formData, commissionPercent: e.target.value })}
            />
            {errors.commissionPercent && <span className="sto-text-danger small d-block mt-1">{errors.commissionPercent}</span>}
            <span className="sto-text-dim small d-block mt-1">Відсоток, який майстер отримує від виконаного замовлення</span>
          </div>

          <div className="mb-4">
            <label className="sto-label">Спеціалізація (Категорія)</label>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.name })}
                  className={`px-3 py-2 rounded-3 border-0 fw-semibold small ${formData.category === cat.name ? 'text-white' : 'sto-text-muted'}`}
                  style={{ backgroundColor: formData.category === cat.name ? 'var(--sto-accent)' : 'var(--sto-border)', cursor: 'pointer' }}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && (
                <span className="sto-text-dim small">Спочатку додайте категорії в заголовку</span>
              )}
            </div>
            {errors.category && <span className="sto-text-danger small d-block mt-1">{errors.category}</span>}
          </div>

          <div className="d-flex justify-content-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="sto-btn sto-btn-ghost">Скасувати</button>
            <button type="submit" className="sto-btn sto-btn-primary">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};
