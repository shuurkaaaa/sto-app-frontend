import React, { useState, useEffect } from 'react';

export const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = categoryName.trim();
    if (!trimmedName) { setError('Введіть назву категорії'); return; }
    setIsLoading(true); setError('');
    try {
      await onAdd(trimmedName);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка сервера');
      console.error('Деталі помилки:', err.response?.data);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 4000 }} onClick={onClose}>
      <div className="sto-modal" style={{ maxWidth: '400px', padding: '25px' }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0 text-light">Нова спеціалізація</h3>
          <button onClick={onClose} className="btn btn-link sto-text-muted small p-0">Закрити</button>
        </div>

        <form onSubmit={handleSubmit} className="d-flex gap-2 align-items-center">
          <input
            autoFocus
            disabled={isLoading}
            className="sto-input flex-grow-1"
            placeholder="Назва (напр. Ходовик)..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <button type="submit" disabled={isLoading} className="sto-btn sto-btn-primary flex-shrink-0">
            {isLoading ? '...' : 'Додати'}
          </button>
        </form>

        {error && (
          <p className="sto-text-danger fw-bold mt-2 small">{error}</p>
        )}
      </div>
    </div>
  );
};
