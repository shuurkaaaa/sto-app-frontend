import React from 'react';

export const StaffToolbar = ({ onAdd, sortBy, onSortChange }) => {
  const sortOptions = [
    { id: 'id', label: 'За датою' },
    { id: 'name', label: "За ім'ям" },
    { id: 'exp', label: 'За досвідом' },
  ];

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <button type="button" onClick={() => onAdd?.()} className="sto-btn sto-btn-primary">
        Додати майстра
      </button>

      <div
        className="d-flex align-items-center gap-1 border"
        style={{ background: 'var(--sto-bg-2)', padding: '4px', borderRadius: '12px', borderColor: 'var(--sto-border)' }}
      >
        {sortOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSortChange(opt.id)}
            className={`px-3 py-2 rounded-3 border-0 fw-semibold small ${sortBy === opt.id ? 'text-light' : 'sto-text-muted'}`}
            style={{ backgroundColor: sortBy === opt.id ? 'var(--sto-border)' : 'transparent', cursor: 'pointer' }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
