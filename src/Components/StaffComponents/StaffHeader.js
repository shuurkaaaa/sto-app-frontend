import React, { useState } from 'react';
import { AddCategoryModal } from './AddCategoryModal';

const styles = {
  headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { margin: 0, fontSize: '28px', color: '#F1F5F9' },
  toolbar: { display: 'flex', gap: '8px', alignItems: 'center', background: '#1E293B', padding: '6px', borderRadius: '14px', border: '1px solid #334155' },
  filterButton: (isActive) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: isActive ? '#818CF8' : 'transparent',
    color: isActive ? '#fff' : '#94A3B8'
  }),
  deleteBtn: { marginLeft: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' },
  addButton: { padding: '8px 16px', borderRadius: '10px', border: '1px dashed #475569', backgroundColor: 'transparent', color: '#94A3B8', cursor: 'pointer', marginLeft: '10px' },
  modeBtn: (isEditMode) => ({ padding: '8px 12px', borderRadius: '10px', border: 'none', backgroundColor: isEditMode ? '#334155' : 'transparent', color: '#94A3B8', cursor: 'pointer' })
};

export const StaffHeader = ({ categories = [], currentFilter, onFilterChange, onAddCategory, onDeleteCategory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Функція-обробник, яка гарантує отримання актуального імені
  const handleModalAdd = async (categoryName) => {
    if (!categoryName || categoryName.trim() === "") return;
    
    try {
      await onAddCategory(categoryName);
      setIsModalOpen(false); // Закриваємо тільки після успіху
    } catch (err) {
      // Помилка вже виводиться в консоль з WorkersContext
    }
  };

  return (
    <>
      <div style={styles.headerContainer}>
        <h1 style={styles.title}>Команда СТО</h1>
        
        <div style={styles.toolbar}>
          <button onClick={() => onFilterChange('Всі')} style={styles.filterButton(currentFilter === 'Всі')}>Всі</button>
          
          {categories?.map(cat => (
            <button key={cat.id} onClick={() => onFilterChange(cat.name)} style={styles.filterButton(currentFilter === cat.name)}>
              {cat.name}
              {isEditMode && (
                <span 
                  style={styles.deleteBtn} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(window.confirm(`Видалити спеціалізацію "${cat.name}"?`)) onDeleteCategory(cat.id); 
                  }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
          
          <button style={styles.modeBtn(isEditMode)} onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? 'Готово' : 'Редагувати'}
          </button>
          
          <button onClick={() => setIsModalOpen(true)} style={styles.addButton}>+ Категорія</button>
        </div>
      </div>

      {/* Перемонтовуємо модалку кожного разу, коли вона відкривається */}
      {isModalOpen && (
        <AddCategoryModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleModalAdd} 
        />
      )}
    </>
  );
};