import React, { useState, useMemo, useEffect } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

const SUGGESTIONS_MAP = {
  'Заміна мастила': ['Мастильний фільтр', 'Прокладка пробки', 'Мастило 5W30'],
  'Діагностика ходової': ['Сайлентблоки', 'Шарові опори', 'Важелі'],
  'Заміна ГРМ': ['Помпа', 'Антифриз', 'Комплект ГРМ'],
  'Заміна колодок': ['Гальмівна рідина', 'Очисник гальм', 'Гальмівні диски'],
};

export const ServiceAddModal = ({ isOpen, onClose, onAdd, categories, editData }) => {
  const { items } = useInventoryContext();

  const [formData, setFormData] = useState({ name: '', price: '', oldPrice: '', category: '', time: '', recommendations: '' });
  const [linkedParts, setLinkedParts] = useState([]);
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          price: editData.price || '',
          oldPrice: editData.oldPrice || '',
          category: editData.priceCategory?.name || editData.categoryName || editData.category || '',
          time: editData.time || '',
          recommendations: editData.recommendations || '',
        });
        const existingParts = (editData.parts || editData.linkedParts || []).map(p => ({
          itemId: p.inventoryId || p.id || p.itemId,
          quantity: p.quantity || 1,
          name: p.name,
        }));
        setLinkedParts(existingParts);
      } else {
        setFormData({ name: '', price: '', oldPrice: '', category: '', time: '', recommendations: '' });
        setLinkedParts([]);
      }
    }
  }, [isOpen, editData]);

  const handleClose = () => {
    setFormData({ name: '', price: '', oldPrice: '', category: '', time: '', recommendations: '' });
    setLinkedParts([]);
    setSelectedInventoryCategory('');
    onClose();
  };

  const currentSuggestions = useMemo(() => {
    if (!formData.name) return [];
    const key = Object.keys(SUGGESTIONS_MAP).find(k => formData.name.toLowerCase().includes(k.toLowerCase()));
    return key ? SUGGESTIONS_MAP[key] : [];
  }, [formData.name]);

  const inventoryCategories = useMemo(() => {
    const cats = items.map(item => (typeof item.category === 'object' ? item.category.name : item.category)).filter(Boolean);
    return [...new Set(cats)];
  }, [items]);

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
    if (!formData.category) { alert('Спершу оберіть категорію послуги!'); return; }
    onAdd({ ...formData, linkedParts });
    handleClose();
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="sto-modal" style={{ maxWidth: '480px' }}>
        <h3 className="text-light mb-3">{editData ? 'Редагувати послугу' : 'Додати послугу'}</h3>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <input
              className="sto-input"
              placeholder="Назва послуги (напр. Заміна мастила)"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {currentSuggestions.length > 0 && (
              <div className="sto-text-success small mt-1 ps-1">
                Порада: додайте {currentSuggestions.join(', ')}
              </div>
            )}
          </div>

          <select
            className="sto-select"
            required
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Оберіть категорію послуги</option>
            {categories.filter(c => c !== 'Всі').map(c => {
              const name = typeof c === 'object' ? c.name : c;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>

          <div className="d-flex gap-2">
            <input className="sto-input" style={{ flex: '1 1 0', minWidth: 0 }} type="number" placeholder="Ціна (грн)" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            <input className="sto-input" style={{ flex: '1 1 0', minWidth: 0 }} type="number" placeholder="Стара ціна" value={formData.oldPrice} onChange={e => setFormData({ ...formData, oldPrice: e.target.value })} />
            <input className="sto-input" style={{ flex: '1 1 0', minWidth: 0 }} type="number" placeholder="Час (хв)" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
          </div>

          <textarea
            className="sto-textarea sto-input"
            style={{ height: '80px', resize: 'none' }}
            placeholder="Рекомендації (що запропонувати клієнту під час цієї послуги)"
            value={formData.recommendations}
            onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
          />

          <div className="rounded-3 p-3 border" style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}>
            <p className="sto-text-muted small fw-bold mb-2">Прив'язати запчастини зі складу:</p>

            <div className="d-flex flex-column gap-2">
              <select className="sto-select small" value={selectedInventoryCategory} onChange={(e) => setSelectedInventoryCategory(e.target.value)}>
                <option value="">1. Спершу оберіть категорію складу...</option>
                {inventoryCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </select>

              <select
                className="sto-select small"
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

            <div className="mt-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
              {linkedParts.map(lp => (
                <div key={lp.itemId} className="d-flex justify-content-between align-items-center py-1 small" style={{ borderBottom: '1px solid var(--sto-border)' }}>
                  <span style={{ color: '#CBD5E1', flex: 1 }}>{lp.name}</span>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      value={lp.quantity}
                      min="1"
                      onChange={(e) => setLinkedParts(linkedParts.map(p => p.itemId === lp.itemId ? { ...p, quantity: Number(e.target.value) } : p))}
                      className="rounded-1 text-center text-light"
                      style={{ width: '45px', background: 'var(--sto-bg)', border: '1px solid var(--sto-border-2)', padding: '2px 5px' }}
                    />
                    <button type="button" onClick={() => setLinkedParts(linkedParts.filter(p => p.itemId !== lp.itemId))} className="btn btn-sm" style={{ background: 'none', border: 'none', color: '#EF4444' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex gap-2 mt-2">
            <button type="button" onClick={handleClose} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
            <button type="submit" className="sto-btn sto-btn-primary flex-grow-1">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  );
};
