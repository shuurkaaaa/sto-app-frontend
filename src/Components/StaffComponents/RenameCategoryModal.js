import React, { useState, useEffect } from 'react';

export const RenameCategoryModal = ({ isOpen, category, onClose, onSave }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      setCategoryName(category.name);
      setError('');
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setError('Введіть назву категорії');
      return;
    }
    if (trimmedName === category.name) {
      onClose();
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onSave(category.id, category.name, trimmedName);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 4000 }} onClick={onClose}>
      <div className="sto-modal" style={{ maxWidth: '400px', padding: '25px' }} onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="m-0 text-light">Перейменувати спеціалізацію</h3>
          <button type="button" onClick={onClose} className="btn btn-link sto-text-muted small p-0">
            Закрити
          </button>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
          <input
            autoFocus
            disabled={isLoading}
            className="sto-input w-100"
            placeholder="Нова назва..."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" disabled={isLoading} onClick={onClose} className="sto-btn sto-btn-ghost">
              Скасувати
            </button>
            <button type="submit" disabled={isLoading} className="sto-btn sto-btn-primary">
              {isLoading ? '...' : 'Зберегти'}
            </button>
          </div>
        </form>

        {error && <p className="sto-text-danger fw-bold mt-2 small mb-0">{error}</p>}
      </div>
    </div>
  );
};
