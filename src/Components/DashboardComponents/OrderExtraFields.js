import React from 'react';

export const OrderExtraFields = ({ formData, setFormData, styles }) => {
  
  // Допоміжна функція для безпечного оновлення полів
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Отримуємо базовий стиль інпуту, якщо styles.input — це функція
  const inputStyle = typeof styles.input === 'function' ? styles.input(false) : (styles.input || {});

  return (
    <div style={{ marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        
        <div style={{ flex: 1 }}>
          <p style={styles.label}>ОПЛАТА:</p>
          <select 
            style={inputStyle} 
            value={formData.payment || ''}
            onChange={e => handleChange('payment', e.target.value)}
          >
            <option value="Готівка">Готівка</option>
            <option value="Карта">Карта</option>
            <option value="Рахунок">Рахунок</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <p style={styles.label}>ГОТОВНІСТЬ:</p>
          <input 
            type="datetime-local" 
            style={inputStyle} 
            value={formData.deadline || ''}
            onChange={e => handleChange('deadline', e.target.value)}
          />
        </div>

      </div>

      <div style={{ marginBottom: '5px' }}>
        <p style={styles.label}>КОМЕНТАР МАЙСТРУ:</p>
        <textarea 
          style={{
            ...inputStyle, 
            height: '80px', 
            resize: 'none', 
            padding: '12px',
            fontFamily: 'inherit',
            lineHeight: '1.5'
          }} 
          placeholder="Опишіть зауваження, скарги або важливі деталі..." 
          value={formData.comment || ''}
          onChange={e => handleChange('comment', e.target.value)}
        />
      </div>
    </div>
  );
};