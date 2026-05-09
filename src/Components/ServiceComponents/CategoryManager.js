import React, { useState } from 'react';
import { usePrice } from '../../Context/PriceContext';

export const CategoryManager = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = usePrice();
  const [newCat, setNewCat] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(''); }
  };
  const startEditing = (cat) => { setEditingId(cat.id); setEditValue(cat.name); };
  const saveEdit = (id) => {
    if (editValue.trim()) { updateCategory(id, editValue.trim()); setEditingId(null); }
  };
  const handleDeleteClick = (catName) => {
    if (window.confirm(`Ви дійсно хочете видалити категорію "${catName}"?`)) deleteCategory(catName);
  };

  return (
    <div className="sto-card-sm sto-card mb-3 p-3">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="sto-text-muted m-0 small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
          Налаштування категорій прайсу
        </h4>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="btn btn-sm sto-text-accent fw-semibold"
          style={{ background: 'none', border: 'none' }}
        >
          {isPanelOpen ? '✕ Закрити' : '+ Керувати'}
        </button>
      </div>

      {isPanelOpen && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--sto-border)' }}>
          <div className="d-flex gap-2 mb-3">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Додати нову категорію..."
              className="sto-input flex-grow-1"
            />
            <button onClick={handleAdd} className="sto-btn sto-btn-primary flex-shrink-0">Додати</button>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                if (catName === 'Всі') return null;
                return (
                  <div
                    key={cat.id}
                    className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border"
                    style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}
                  >
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(cat.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                        className="sto-text-accent small"
                        style={{ background: 'none', border: 'none', outline: 'none', width: '100px' }}
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(cat)}
                        className="text-light small"
                        style={{ cursor: 'pointer' }}
                        title="Натисніть, щоб редагувати"
                      >
                        {catName}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteClick(catName)}
                      className="btn-close-sm fw-bold"
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="sto-text-dim small fst-italic">Категорій поки немає</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
