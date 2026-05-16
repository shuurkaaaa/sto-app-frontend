import React, { useState } from 'react';
import { AddCategoryModal } from './AddCategoryModal';
import { RenameCategoryModal } from './RenameCategoryModal';

export const StaffHeader = ({
  categories = [],
  currentFilter,
  onFilterChange,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleModalAdd = async (categoryName) => {
    if (!categoryName || categoryName.trim() === '') return;
    try {
      await onAddCategory(categoryName);
      setIsModalOpen(false);
    } catch (err) {

    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0 fs-3 text-light">Команда СТО</h1>

        <div
          className="d-flex gap-2 align-items-center border"
          style={{ background: 'var(--sto-bg-2)', padding: '6px', borderRadius: '14px', borderColor: 'var(--sto-border)' }}
        >
          <button
            type="button"
            onClick={() => onFilterChange('Всі')}
            className={`px-3 py-2 rounded-3 border-0 fw-semibold small ${currentFilter === 'Всі' ? 'text-white' : 'sto-text-muted'}`}
            style={{ backgroundColor: currentFilter === 'Всі' ? 'var(--sto-accent)' : 'transparent', cursor: 'pointer' }}
          >
            Всі
          </button>

          {categories?.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onFilterChange(cat.name)}
              className={`px-3 py-2 rounded-3 border-0 fw-semibold small ${currentFilter === cat.name ? 'text-white' : 'sto-text-muted'}`}
              style={{ backgroundColor: currentFilter === cat.name ? 'var(--sto-accent)' : 'transparent', cursor: 'pointer' }}
            >
              {cat.name}
              {isEditMode && (
                <>
                  <span
                    className="ms-1 small"
                    style={{ cursor: 'pointer', opacity: 0.85 }}
                    title="Перейменувати"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTarget({ id: cat.id, name: cat.name });
                    }}
                  >
                    ✎
                  </span>
                  <span
                    className="ms-1 fw-bold"
                    style={{ color: '#ef4444', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Видалити спеціалізацію "${cat.name}"?`)) onDeleteCategory(cat.id);
                    }}
                  >
                    ×
                  </span>
                </>
              )}
            </button>
          ))}

          <button
            type="button"
            className={`px-3 py-2 rounded-3 border-0 sto-text-muted ${isEditMode ? '' : 'bg-transparent'}`}
            style={{ backgroundColor: isEditMode ? 'var(--sto-border)' : 'transparent', cursor: 'pointer' }}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'Готово' : 'Редагувати'}
          </button>

          <button onClick={() => setIsModalOpen(true)} className="sto-btn-dashed ms-2" style={{ width: 'auto', padding: '8px 16px' }}>
            + Категорія
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleModalAdd}
        />
      )}

      <RenameCategoryModal
        isOpen={!!renameTarget}
        category={renameTarget}
        onClose={() => setRenameTarget(null)}
        onSave={onRenameCategory}
      />
    </>
  );
};
