import React from 'react';

export const SmartCompatibility = ({ compatibility, onTagClick }) => {
  let tags = [];
  
  if (typeof compatibility === 'string' && compatibility.trim() !== '') {
    tags = compatibility.split(',')
      .map(item => item.trim())
      .filter(item => item !== "" && item.toLowerCase() !== "null");
  } 
  else if (Array.isArray(compatibility)) {
    tags = compatibility.filter(item => item && String(item).trim() !== "");
  }

  if (tags.length === 0) {
    return <span style={{ color: '#475569', fontSize: '12px' }}>Універсальне</span>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {tags.map((tag, index) => (
        <span 
          key={index} 
          style={{
            backgroundColor: '#334155',
            color: '#F1F5F9',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            border: '1px solid #475569'
          }}
          onClick={() => onTagClick && onTagClick(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};