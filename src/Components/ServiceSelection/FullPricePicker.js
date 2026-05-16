import React, { useState } from 'react';
import { usePrice } from '../../Context/PriceContext';

export const FullPricePicker = ({ isOpen, onClose, onSelect, selectedServices }) => {
  const { services, categories } = usePrice();
  const [activeCategory, setActiveCategory] = useState('Всі');

  if (!isOpen) return null;

  const catList = ['Всі', ...categories.map(c => typeof c === 'object' ? c.name : c)];

  const filteredServices = activeCategory === 'Всі'
    ? services
    : services.filter(s => {
        const sCat = s.priceCategory?.name || s.categoryName || s.category;
        return sCat === activeCategory;
      });

  const isSelected = (id) => selectedServices.some(s => s.id === id);

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 5000 }} onClick={onClose}>
      <div
        className="sto-modal d-flex flex-column overflow-hidden"
        style={{ maxWidth: '900px', height: '85vh', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ padding: '20px 25px', borderBottom: '1px solid var(--sto-border)', background: 'var(--sto-bg-2)' }}
        >
          <h3 className="m-0" style={{ color: '#F8FAFC' }}>Каталог послуг СТО</h3>
          <button
            onClick={onClose}
            className="sto-text-muted px-3"
            style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}
          >&times;</button>
        </div>

        <div className="d-flex flex-grow-1 overflow-hidden">
          <div
            className="overflow-auto"
            style={{ width: '220px', borderRight: '1px solid var(--sto-border)', padding: '20px 10px', background: 'var(--sto-bg)' }}
          >
            {catList.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-100 text-start rounded-3 mb-1 ${activeCategory === cat ? 'text-white fw-semibold' : 'sto-text-muted'}`}
                style={{
                  padding: '12px 15px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeCategory === cat ? 'var(--sto-accent-2)' : 'transparent',
                  fontSize: '14px',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            className="d-grid p-4 overflow-auto flex-grow-1"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', alignContent: 'start', background: 'var(--sto-bg-2)' }}
          >
            {filteredServices.map(s => (
              <div
                key={s.id}
                onClick={() => onSelect(s)}
                className="d-flex justify-content-between align-items-center rounded-3 p-3 border"
                style={{
                  borderColor: isSelected(s.id) ? 'var(--sto-accent-2)' : 'var(--sto-border)',
                  background: isSelected(s.id) ? '#1e3a8a' : 'var(--sto-bg)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <span className="text-light fw-semibold d-block mb-1">{s.name}</span>
                  <span className="sto-text-success fw-bold small">{s.price} грн</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{isSelected(s.id) ? '−' : '+'}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="text-end"
          style={{ padding: '20px 25px', borderTop: '1px solid var(--sto-border)', background: 'var(--sto-bg-2)' }}
        >
          <button onClick={onClose} className="sto-btn sto-btn-blue">
            Зберегти вибране ({selectedServices.length})
          </button>
        </div>
      </div>
    </div>
  );
};
