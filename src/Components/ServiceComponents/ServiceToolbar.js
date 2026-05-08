import React from 'react';
import { serviceStyles } from './ServiceStyles';

export const ServiceToolbar = ({ 
  searchTerm, 
  onSearchChange, 
  categories, 
  selectedCategory, 
  onCategoryChange,
  onOpenAddModal 
}) => (
  <div style={serviceStyles.toolbar}>
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          placeholder="Пошук послуги..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={serviceStyles.searchInput}
        />
      </div>

      <button 
        onClick={onOpenAddModal}
        style={{
          ...serviceStyles.catButton,
          backgroundColor: '#818CF8',
          color: '#F1F5F9',
          padding: '12px 25px',
          border: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        Додати послугу
      </button>
    </div>
    
    <div style={serviceStyles.categoryBar}>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          style={{
            ...serviceStyles.catButton,
            backgroundColor: selectedCategory === cat ? '#818CF8' : '#1E293B',
            color: selectedCategory === cat ? '#F1F5F9' : '#94A3B8',
            borderColor: selectedCategory === cat ? '#818CF8' : '#334155',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);