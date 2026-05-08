import React, { useState, useMemo, useEffect } from 'react';
import { serviceStyles } from './ServiceStyles';
import { useInventoryContext } from '../../Context/InventoryContext';

// Мапа підказок для рекомендацій залежно від назви послуги
const SUGGESTIONS_MAP = {
  "Заміна мастила": ["Мастильний фільтр", "Прокладка пробки", "Мастило 5W30"],
  "Діагностика ходової": ["Сайлентблоки", "Шарові опори", "Важелі"],
  "Заміна ГРМ": ["Помпа", "Антифриз", "Комплект ГРМ"],
  "Заміна колодок": ["Гальмівна рідина", "Очисник гальм", "Гальмівні диски"]
};

export const ServiceAddModal = ({ isOpen, onClose, onAdd, categories, editData }) => {
  const { items } = useInventoryContext();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    oldPrice: '', 
    category: '', 
    time: '',
    recommendations: '' 
  });
  
  const [linkedParts, setLinkedParts] = useState([]);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState('');

  // Ефект для ініціалізації даних при відкритті (редагування або створення)
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          price: editData.price || '',
          oldPrice: editData.oldPrice || '',
          category: editData.priceCategory?.name || editData.categoryName || editData.category || '',
          time: editData.time || '',
          recommendations: editData.recommendations || ''
        });
        const existingParts = (editData.parts || editData.linkedParts || []).map(p => ({
          itemId: p.inventoryId || p.id || p.itemId,
          quantity: p.quantity || 1,
          name: p.name
        }));
        setLinkedParts(existingParts);
      } else {
        // Скидання форми для нової послуги
        setFormData({ name: '', price: '', oldPrice: '', category: '', time: '', recommendations: '' });
        setLinkedParts([]);
      }
    }
  }, [isOpen, editData]);

  // Функція закриття з повним очищенням стейту
  const handleClose = () => {
    setFormData({ name: '', price: '', oldPrice: '', category: '', time: '', recommendations: '' });
    setLinkedParts([]);
    setSelectedInventoryCategory('');
    onClose(); // Виклик функції закриття з батьківського компонента
  };

  // Логіка підказок на основі введеної назви
  const currentSuggestions = useMemo(() => {
    if (!formData.name) return [];
    const key = Object.keys(SUGGESTIONS_MAP).find(k => 
      formData.name.toLowerCase().includes(k.toLowerCase())
    );
    return key ? SUGGESTIONS_MAP[key] : [];
  }, [formData.name]);

  // Унікальні категорії товарів зі складу
  const inventoryCategories = useMemo(() => {
    const cats = items.map(item => {
      if (typeof item.category === 'object') return item.category.name;
      return item.category;
    }).filter(Boolean);
    return [...new Set(cats)];
  }, [items]);

  // Фільтрація товарів складу за обраною категорією
  const filteredInventoryItems = useMemo(() => {
    if (!selectedInventoryCategory) return [];
    return items.filter(item => {
      const catName = typeof item.category === 'object' ? item.category.name : item.category;
      return catName === selectedInventoryCategory;
    });
  }, [selectedInventoryCategory, items]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) {
        alert("Спершу оберіть категорію послуги!");
        return;
    }
    // Передаємо дані в батьківський компонент
    onAdd({ ...formData, linkedParts });
    handleClose();
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h3 style={{ color: '#F1F5F9', marginBottom: '15px' }}>
          {editData ? 'Редагувати послугу' : 'Додати послугу'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Назва та підказки */}
          <div>
            <input 
              style={serviceStyles.searchInput} 
              placeholder="Назва послуги (напр. Заміна мастила)" 
              required
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            {currentSuggestions.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#4ADE80', paddingLeft: '5px' }}>
                💡 Порада: додайте {currentSuggestions.join(', ')}
              </div>
            )}
          </div>
          
          {/* Категорія послуги */}
          <select 
            style={serviceStyles.searchInput} 
            required
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})}
          >
            <option value="">Оберіть категорію послуги</option>
            {categories.filter(c => c !== 'Всі').map(c => {
              const name = typeof c === 'object' ? c.name : c;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>

          {/* Ціни та Час */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              style={{ ...serviceStyles.searchInput, flex: 1.5 }} 
              type="number" 
              placeholder="Ціна (грн)" 
              required
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
            <input 
              style={{ ...serviceStyles.searchInput, flex: 1 }} 
              type="number" 
              placeholder="Стара ціна" 
              value={formData.oldPrice} 
              onChange={e => setFormData({...formData, oldPrice: e.target.value})}
            />
            <input 
              style={{ ...serviceStyles.searchInput, flex: 1 }} 
              type="number" 
              placeholder="Час (хв)"
              value={formData.time} 
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>

          {/* Рекомендації */}
          <textarea 
            style={{ 
              ...serviceStyles.searchInput, 
              height: '80px', 
              paddingTop: '10px', 
              resize: 'none',
              fontFamily: 'inherit'
            }} 
            placeholder="Рекомендації (що запропонувати клієнту під час цієї послуги)" 
            value={formData.recommendations} 
            onChange={e => setFormData({...formData, recommendations: e.target.value})}
          />

          {/* Блок складських запчастин */}
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
            <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
              Прив'язати запчастини зі складу:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select 
                style={{ ...serviceStyles.searchInput, fontSize: '13px', borderColor: '#475569' }}
                value={selectedInventoryCategory}
                onChange={(e) => setSelectedInventoryCategory(e.target.value)}
              >
                <option value="">1. Спершу оберіть категорію складу...</option>
                {inventoryCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select 
                style={{ ...serviceStyles.searchInput, fontSize: '13px' }}
                disabled={!selectedInventoryCategory}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const item = items.find(i => i.id === id);
                  if (id && !linkedParts.find(p => p.itemId === id)) {
                    setLinkedParts([...linkedParts, { itemId: id, quantity: 1, name: item.name }]);
                  }
                }}
                value=""
              >
                <option value="">2. Оберіть конкретну деталь...</option>
                {filteredInventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.current} шт) — {item.price} грн
                  </option>
                ))}
              </select>
            </div>

            {/* Список обраних запчастин */}
            <div style={{ marginTop: '10px', maxHeight: '100px', overflowY: 'auto' }}>
              {linkedParts.map(lp => (
                <div key={lp.itemId} style={modalStyles.partRow}>
                  <span style={{ color: '#CBD5E1', flex: 1 }}>{lp.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="number" 
                      value={lp.quantity} 
                      min="1"
                      onChange={(e) => setLinkedParts(linkedParts.map(p => p.itemId === lp.itemId ? {...p, quantity: Number(e.target.value)} : p))}
                      style={modalStyles.qtyInput}
                    />
                    <button 
                      type="button" 
                      onClick={() => setLinkedParts(linkedParts.filter(p => p.itemId !== lp.itemId))}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0 5px' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки дій */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={handleClose} 
              style={{ ...serviceStyles.catButton, flex: 1, backgroundColor: '#334155' }}
            >
              Скасувати
            </button>
            <button 
              type="submit" 
              style={{...serviceStyles.catButton, flex: 1, backgroundColor: '#818CF8', color: 'white'}}
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Внутрішні стилі модального вікна
const modalStyles = {
  overlay: { 
    position: 'fixed', 
    inset: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 9999 
  },
  content: { 
    backgroundColor: '#1E293B', 
    padding: '25px', 
    borderRadius: '20px', 
    width: '480px', 
    border: '1px solid #334155',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  partRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '6px 0', 
    borderBottom: '1px solid #334155', 
    fontSize: '13px' 
  },
  qtyInput: { 
    width: '45px', 
    background: '#0F172A', 
    border: '1px solid #475569', 
    color: 'white', 
    borderRadius: '4px', 
    padding: '2px 5px', 
    textAlign: 'center' 
  }
};