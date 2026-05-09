import React, { useState } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

export const CategoryFilters = ({
  selectedCategory, onSelectCategory, isLowStockFilter, onToggleLowStock, deficitCount,
}) => {
  const { categories, addCategory, deleteCategory, editCategory } = useInventoryContext();
  const [newCatName, setNewCatName] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmedName = newCatName.trim();
    if (!trimmedName) return;
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Категорія з такою назвою вже є у списку');
      return;
    }
    setLoading(true);
    try {
      await addCategory(trimmedName);
      setNewCatName('');
    } catch (err) {
      alert(`Сервер відхилив запит: ${err.response?.data?.message || err.message || 'Помилка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
      try { await deleteCategory(id); } catch { alert('Не вдалося видалити.'); }
    }
  };

  const handleEdit = async (id, oldName) => {
    const newName = prompt('Нова назва категорії:', oldName);
    if (newName && newName.trim() !== oldName) {
      try { await editCategory(id, newName.trim()); } catch (err) {
        alert(err.response?.data?.message || 'Не вдалося оновити назву');
      }
    }
  };

  return (
    <div className="sto-card mb-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0 text-light" style={{ fontSize: '18px' }}>Фільтр за категоріями</h3>
        <button
          onClick={onToggleLowStock}
          className="sto-btn fw-bold small"
          style={{ background: isLowStockFilter ? '#F87171' : 'var(--sto-border)', color: '#fff' }}
        >
          {isLowStockFilter ? 'Показати все' : `Дефіцит (${deficitCount})`}
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`sto-tab ${selectedCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="pt-3" style={{ borderTop: '1px solid var(--sto-border)' }}>
        <div
          onClick={() => setIsManageMode(!isManageMode)}
          className="sto-text-muted small mb-2"
          style={{ cursor: 'pointer' }}
        >
          {isManageMode ? '▲ Приховати керування' : '⚙ Налаштування категорій'}
        </div>

        {isManageMode && (
          <div className="rounded-3 p-3" style={{ background: 'var(--sto-bg)' }}>
            <div className="d-flex gap-2 mb-3">
              <input
                placeholder="Назва нової категорії"
                value={newCatName}
                disabled={loading}
                onChange={(e) => setNewCatName(e.target.value)}
                className="sto-input"
              />
              <button
                onClick={handleAdd}
                disabled={loading}
                className="sto-btn sto-btn-primary"
                style={{ opacity: loading ? 0.5 : 1 }}
              >
                {loading ? '...' : 'Додати'}
              </button>
            </div>

            <div className="d-flex flex-column gap-1">
              {categories.filter(c => c.id !== 'all').map(cat => (
                <div
                  key={cat.id}
                  className="d-flex justify-content-between p-2 rounded-2"
                  style={{ background: 'var(--sto-bg-2)' }}
                >
                  <span className="text-light">{cat.name}</span>
                  <div>
                    <button
                      onClick={() => handleEdit(cat.id, cat.name)}
                      className="border-0 me-3"
                      style={{ background: 'none', color: '#60A5FA', cursor: 'pointer' }}
                    >
                      Ред.
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="border-0 sto-text-danger"
                      style={{ background: 'none', cursor: 'pointer' }}
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
