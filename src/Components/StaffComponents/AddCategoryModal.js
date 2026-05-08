import React, { useState, useEffect } from 'react';

export const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Очищаємо стан при кожному відкритті модалки
  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Запобігаємо спливанню події
    
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      setError('Введіть назву категорії');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Викликаємо функцію з контексту
      await onAdd(trimmedName);
      // Якщо успішно — закриваємо
      onClose();
    } catch (err) {
      // Якщо сервер повернув 400 або іншу помилку
      setError(err.response?.data?.message || 'Помилка сервера');
      console.error("Деталі помилки:", err.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ margin: 0, color: '#F1F5F9' }}>Нова спеціалізація</h3>
          <button onClick={onClose} style={styles.closeBtn}>Закрити</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input 
            autoFocus
            disabled={isLoading}
            style={styles.input}
            placeholder="Назва (напр. Ходовик)..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit" disabled={isLoading} style={styles.btnPrim}>
            {isLoading ? '...' : 'Додати'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '10px', fontWeight: 'bold' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 4000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' },
  modal: { backgroundColor: '#1E293B', padding: '25px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px rgba(0,0,0,0.3)', border: '1px solid #334155' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer', color: '#94A3B8' },
  form: { display: 'flex', gap: '10px', alignItems: 'center' },
  input: { flex: 1, minWidth: 0, padding: '10px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0F172A', color: '#F1F5F9', outline: 'none' },
  btnPrim: { padding: '10px 20px', backgroundColor: '#818CF8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }
};