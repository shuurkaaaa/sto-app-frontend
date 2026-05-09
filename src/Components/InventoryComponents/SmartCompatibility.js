import React from 'react';

export const SmartCompatibility = ({ compatibility, onTagClick }) => {
  let tags = [];
  if (typeof compatibility === 'string' && compatibility.trim() !== '') {
    tags = compatibility.split(',').map(i => i.trim()).filter(i => i !== '' && i.toLowerCase() !== 'null');
  } else if (Array.isArray(compatibility)) {
    tags = compatibility.filter(i => i && String(i).trim() !== '');
  }

  if (tags.length === 0) {
    return <span className="sto-text-dim small">Універсальне</span>;
  }

  return (
    <div className="d-flex flex-wrap gap-1">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="sto-compat-tag"
          onClick={() => onTagClick && onTagClick(tag)}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
