import React, { useState, useEffect } from 'react';
import { useWorkers } from '../../Context/WorkersContext';

export const StaffModal = ({ isOpen, onClose, onSave, worker }) => {
  const { categories } = useWorkers();
  const [formData, setFormData] = useState({ name: '', role: '', exp: '', category: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (worker) {
        // Отримуємо назву категорії з об'єкта staffCategory (результат include у Prisma)
        const workerCatName = worker.staffCategory?.name || '';
          
        setFormData({
          name: worker.name || '',
          role: worker.role || '',
          exp: worker.exp || '',
          category: workerCatName
        });
      } else {
        // Для нового працівника ставимо першу доступну категорію за замовчуванням
        const defaultCategory = categories.length > 0 ? categories[0].name : '';
        setFormData({ name: '', role: '', exp: '', category: defaultCategory });
      }
      setErrors({});
    }
  }, [worker, isOpen, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Введіть ПІБ майстра";
    if (!formData.role.trim()) newErrors.role = "Вкажіть посаду (напр. Моторист)";
    if (!formData.category) newErrors.category = "Оберіть спеціалізацію";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Знаходимо об'єкт обраної категорії, щоб отримати її ID для зв'язку в БД
    const selectedCat = categories.find(c => c.name === formData.category);
    
    onSave({
      id: worker ? worker.id : null, 
      name: formData.name.trim(),
      role: formData.role.trim(),
      exp: parseInt(formData.exp, 10) || 0,
      // Використовуємо staffCategoryId для коректного зв'язку з Prisma
      staffCategoryId: selectedCat ? selectedCat.id : null
    });
  };

  const inputStyle = (hasError) => ({
    width: '100%', 
    padding: '12px', 
    boxSizing: 'border-box', 
    borderRadius: '12px',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    outline: 'none', 
    fontSize: '14px', 
    color: '#F1F5F9', 
    backgroundColor: '#0F172A', 
    transition: 'border-color 0.2s',
    marginTop: '5px'
  });

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', color: '#F1F5F9' }}>
          {worker ? 'Редагувати майстра' : ' Новий працівник'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={modalStyles.label}>ПІБ майстра *</label>
            <input 
              style={inputStyle(errors.name)} 
              placeholder="Прізвище та Ім'я" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            {errors.name && <span style={modalStyles.errorText}>{errors.name}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={modalStyles.label}>Посада *</label>
            <input 
              style={inputStyle(errors.role)} 
              placeholder="Наприклад: Моторист" 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})} 
            />
            {errors.role && <span style={modalStyles.errorText}>{errors.role}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={modalStyles.label}>Досвід роботи (повних років)</label>
            <input 
              type="number" 
              min="0"
              style={inputStyle(false)} 
              placeholder="0"
              value={formData.exp} 
              onChange={e => setFormData({...formData, exp: e.target.value})} 
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={modalStyles.label}>Спеціалізація (Категорія)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  type="button" 
                  onClick={() => setFormData({...formData, category: cat.name})}
                  style={{
                    padding: '10px 16px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    transition: '0.2s',
                    backgroundColor: formData.category === cat.name ? '#818CF8' : '#334155',
                    color: formData.category === cat.name ? '#FFFFFF' : '#94A3B8'
                  }}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && (
                <span style={{ color: '#64748b', fontSize: '12px' }}>Спочатку додайте категорії в заголовку</span>
              )}
            </div>
            {errors.category && <span style={modalStyles.errorText}>{errors.category}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={modalStyles.btnCancel}>Скасувати</button>
            <button type="submit" style={modalStyles.btnSave}>Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 5000, 
    backdropFilter: 'blur(8px)' 
  },
  modal: { 
    background: '#1E293B', 
    padding: '32px', 
    borderRadius: '24px', 
    width: '440px', 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
    border: '1px solid #334155' 
  },
  label: { 
    display: 'block', 
    fontSize: '11px', 
    fontWeight: '800', 
    color: '#94A3B8', 
    marginBottom: '4px', 
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '11px',
    marginTop: '4px',
    display: 'block'
  },
  btnCancel: { 
    padding: '12px 20px', 
    borderRadius: '12px', 
    border: '1px solid #334155', 
    cursor: 'pointer', 
    background: 'transparent', 
    color: '#94A3B8', 
    fontWeight: '600',
    transition: '0.2s'
  },
  btnSave: { 
    padding: '12px 28px', 
    borderRadius: '12px', 
    border: 'none', 
    background: '#818CF8', 
    color: 'white', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: '0.2s',
    boxShadow: '0 4px 6px -1px rgba(129, 140, 248, 0.4)'
  }
};