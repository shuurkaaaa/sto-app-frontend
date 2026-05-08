import React, { useState } from 'react';
import { usePrice } from '../../Context/PriceContext';
import { serviceStyles } from './ServiceStyles';

export const CategoryManager = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = usePrice();
  const [newCat, setNewCat] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newCat.trim()) {
      addCategory(newCat.trim());
      setNewCat('');
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
  };

  const saveEdit = (id) => {
    if (editValue.trim()) {
      updateCategory(id, editValue.trim());
      setEditingId(null);
    }
  };

  const handleDeleteClick = (catName) => {
    const isConfirmed = window.confirm(`Ви дійсно хочете видалити категорію "${catName}"?`);
    if (isConfirmed) {
      deleteCategory(catName);
    }
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', background: '#1E293B', borderRadius: '12px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: '#94A3B8', margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Налаштування категорій прайсу
        </h4>
        <button 
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
        >
          {isPanelOpen ? '✕ Закрити' : '+ Керувати'}
        </button>
      </div>

      {isPanelOpen && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Додати нову категорію..."
              style={{ ...serviceStyles.searchInput, flex: 1, marginBottom: 0, height: '38px' }}
            />
            <button 
              onClick={handleAdd}
              style={{ 
                padding: '0 20px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: '#818CF8', 
                color: 'white', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Додати
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.length > 0 ? (
              categories.map((cat) => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                if (catName === 'Всі') return null;
                
                return (
                  <div key={cat.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    background: '#0F172A', padding: '6px 12px', borderRadius: '20px',
                    border: '1px solid #334155'
                  }}>
                    {editingId === cat.id ? (
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(cat.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                        style={{ 
                          background: 'none', border: 'none', color: '#818CF8', 
                          fontSize: '13px', outline: 'none', width: '100px' 
                        }}
                      />
                    ) : (
                      <span 
                        onClick={() => startEditing(cat)}
                        style={{ color: '#F1F5F9', fontSize: '13px', cursor: 'pointer' }}
                        title="Натисніть, щоб редагувати"
                      >
                        {catName}
                      </span>
                    )}
                    <button 
                      onClick={() => handleDeleteClick(catName)}
                      style={{ 
                        background: 'none', border: 'none', color: '#EF4444', 
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#64748B', fontSize: '12px', fontStyle: 'italic' }}>Категорій поки немає</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};