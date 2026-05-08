import React from 'react';

export const StaffToolbar = ({ onAdd, sortBy, onSortChange }) => {
  const sortOptions = [
    { id: 'id', label: 'За датою' },
    { id: 'name', label: 'За ім\'ям' },
    { id: 'exp', label: 'За досвідом' }
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
      <button 
        onClick={onAdd} 
        style={{ 
          padding: '12px 24px', 
          background: '#818CF8', 
          color: 'white', 
          border: 'none', 
          borderRadius: '12px', 
          cursor: 'pointer', 
          fontWeight: 'bold' 
        }}
      >
        Додати майстра
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', padding: '4px', borderRadius: '12px', border: '1px solid #334155' }}>
        {sortOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSortChange(opt.id)}
            style={{
              padding: '8px 12px', 
              borderRadius: '10px', 
              border: 'none', 
              cursor: 'pointer',
              backgroundColor: sortBy === opt.id ? '#334155' : 'transparent',
              color: sortBy === opt.id ? '#F1F5F9' : '#94A3B8',
              fontWeight: '600', 
              fontSize: '13px'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};