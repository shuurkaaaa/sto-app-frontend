import React, { useState } from 'react';
import { inventoryStyles } from './InventoryStyles';
import { useInventoryContext } from '../../Context/InventoryContext';

export const CategoryFilters = ({ 
  selectedCategory, 
  onSelectCategory, 
  isLowStockFilter, 
  onToggleLowStock, 
  deficitCount 
}) => {
  const { categories, addCategory, deleteCategory, editCategory } = useInventoryContext();
  const [newCatName, setNewCatName] = useState('');
  const [isManageMode, setIsManageMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmedName = newCatName.trim();
    if (!trimmedName) return;

    // Локальна перевірка на дублікат перед запитом
    const exists = categories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase());
    if (exists) {
      alert("Категорія з такою назвою вже є у списку (локальна перевірка)");
      return;
    }

    setLoading(true);
    try {
      await addCategory(trimmedName); 
      setNewCatName('');
    } catch (error) {
      // Виводимо текст помилки з бекенду, якщо він є
      const serverMsg = error.response?.data?.message || error.message || "Помилка при додаванні";
      alert(`Сервер відхилив запит: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю категорію?")) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert("Не вдалося видалити. Можливо, в цій категорії ще є запчастини.");
      }
    }
  };

  const handleEdit = async (id, oldName) => {
    const newName = prompt('Нова назва категорії:', oldName);
    if (newName && newName.trim() !== oldName) {
      try {
        await editCategory(id, newName.trim());
      } catch (error) {
        const serverMsg = error.response?.data?.message || "Не вдалося оновити назву";
        alert(serverMsg);
      }
    }
  };

  return (
    <div style={{ ...inventoryStyles.tableCard, padding: '20px', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#F1F5F9', margin: 0, fontSize: '18px' }}>Фільтр за категоріями</h3>
        <button 
          onClick={onToggleLowStock} 
          style={{ 
            ...inventoryStyles.purchaseButton, 
            backgroundColor: isLowStockFilter ? '#F87171' : '#334155',
            fontSize: '13px'
          }}
        >
          {isLowStockFilter ? 'Показати все' : `Дефіцит (${deficitCount})`}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedCategory === cat.name ? '#818CF8' : '#1E293B',
              color: 'white',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat.name ? 'bold' : 'normal',
              transition: '0.2s'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
        <div 
          onClick={() => setIsManageMode(!isManageMode)}
          style={{ color: '#94A3B8', fontSize: '12px', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center' }}
        >
          {isManageMode ? '▲ Приховати керування' : '⚙ Налаштування категорій'}
        </div>

        {isManageMode && (
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input 
                placeholder="Назва нової категорії" 
                value={newCatName} 
                disabled={loading}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{ ...inventoryStyles.modalInput, margin: 0 }}
              />
              <button 
                onClick={handleAdd}
                disabled={loading}
                style={{ ...inventoryStyles.mainAddButton, padding: '0 20px', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? '...' : 'Додати'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {categories.filter(c => c.id !== 'all').map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#1E293B', borderRadius: '5px' }}>
                  <span style={{ color: '#F1F5F9' }}>{cat.name}</span>
                  <div>
                    <button 
                      onClick={() => handleEdit(cat.id, cat.name)} 
                      style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', marginRight: '10px' }}
                    >
                      Ред.
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer' }}
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