import React from 'react';

export const ServiceToolbar = ({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onOpenAddModal,
}) => (
  <div className="d-flex flex-column gap-3 mb-4">
    <div className="d-flex gap-3 align-items-center">
      <input
        type="text"
        placeholder="Пошук послуги..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sto-input flex-grow-1"
      />
      <button onClick={onOpenAddModal} className="sto-btn sto-btn-primary text-nowrap">
        Додати послугу
      </button>
    </div>

    <div className="d-flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-3 py-2 rounded-3 fw-semibold small border ${selectedCategory === cat ? 'text-white' : 'sto-text-muted'}`}
          style={{
            background: selectedCategory === cat ? 'var(--sto-accent)' : 'var(--sto-bg-2)',
            borderColor: selectedCategory === cat ? 'var(--sto-accent)' : 'var(--sto-border)',
            cursor: 'pointer',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);
