import React, { useState } from 'react';
import { usePrice } from '../../Context/PriceContext';

export const FullPricePicker = ({ isOpen, onClose, onSelect, selectedServices }) => {
  const { services, categories } = usePrice();
  const [activeCategory, setActiveCategory] = useState('Всі');

  if (!isOpen) return null;

  // Формуємо чистий список назв категорій для відображення
  const catList = ['Всі', ...categories.map(c => typeof c === 'object' ? c.name : c)];
  
  // Фільтрація послуг за вибраною категорією
  const filteredServices = activeCategory === 'Всі' 
    ? services 
    : services.filter(s => {
        const sCat = s.priceCategory?.name || s.categoryName || s.category;
        return sCat === activeCategory;
      });

  const isSelected = (id) => selectedServices.some(s => s.id === id);

  const pickerStyles = {
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 5000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      backdropFilter: 'blur(6px)' 
    },
    window: { 
      backgroundColor: '#1E293B', width: '900px', height: '85vh', 
      borderRadius: '20px', display: 'flex', flexDirection: 'column', 
      overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
    },
    header: { 
      padding: '20px 25px', borderBottom: '1px solid #334155', 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      background: '#1e293b' 
    },
    closeX: { 
      background: 'none', border: 'none', fontSize: '28px', 
      cursor: 'pointer', color: '#94A3B8', padding: '0 10px' 
    },
    body: { flex: 1, display: 'flex', overflow: 'hidden' },
    sidebar: { 
      width: '220px', borderRight: '1px solid #334155', 
      padding: '20px 10px', overflowY: 'auto', backgroundColor: '#0F172A' 
    },
    catBtn: (isActive) => ({ 
      width: '100%', padding: '12px 15px', marginBottom: '6px', 
      textAlign: 'left', border: 'none', borderRadius: '10px', 
      cursor: 'pointer', transition: '0.2s', fontSize: '14px',
      backgroundColor: isActive ? '#3b82f6' : 'transparent',
      color: isActive ? 'white' : '#94A3B8',
      fontWeight: isActive ? '600' : '400'
    }),
    grid: { 
      flex: 1, padding: '25px', display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '15px', overflowY: 'auto', background: '#1e293b', alignContent: 'start'
    },
    card: (selected) => ({ 
      padding: '18px', borderRadius: '14px', border: '1px solid', 
      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', 
      alignItems: 'center', transition: '0.2s',
      borderColor: selected ? '#3b82f6' : '#334155',
      backgroundColor: selected ? '#1e3a8a' : '#0F172A'
    }),
    footer: { 
      padding: '20px 25px', borderTop: '1px solid #334155', 
      textAlign: 'right', background: '#1e293b' 
    },
    doneBtn: { 
      padding: '12px 35px', backgroundColor: '#3b82f6', 
      color: 'white', border: 'none', borderRadius: '12px', 
      cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' 
    }
  };

  return (
    <div style={pickerStyles.overlay} onClick={onClose}>
      <div style={pickerStyles.window} onClick={e => e.stopPropagation()}>
        <div style={pickerStyles.header}>
          <h3 style={{color: '#F8FAFC', margin: 0}}>📚 Каталог послуг СТО</h3>
          <button onClick={onClose} style={pickerStyles.closeX}>&times;</button>
        </div>

        <div style={pickerStyles.body}>
          <div style={pickerStyles.sidebar}>
            {catList.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                style={pickerStyles.catBtn(activeCategory === cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={pickerStyles.grid}>
            {filteredServices.map(s => (
              <div 
                key={s.id} 
                onClick={() => onSelect(s)}
                style={pickerStyles.card(isSelected(s.id))}
              >
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <span style={{color: '#F1F5F9', display: 'block', fontWeight: '600', marginBottom: '4px'}}>
                    {s.name}
                  </span>
                  <span style={{color: '#4ade80', fontSize: '14px', fontWeight: '700'}}>
                    {s.price} грн
                  </span>
                </div>
                <div style={{fontSize: '20px'}}>
                  {isSelected(s.id) ? '✅' : '➕'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={pickerStyles.footer}>
          <button 
            onClick={onClose} 
            style={pickerStyles.doneBtn}
          >
            Зберегти вибране ({selectedServices.length})
          </button>
        </div>
      </div>
    </div>
  );
};