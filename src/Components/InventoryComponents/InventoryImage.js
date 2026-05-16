import React, { useState } from 'react';

export const InventoryImage = ({ source, src, itemName, name }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const SERVER_URL = 'http://127.0.0.1:5000';
  const path = source || src;
  const label = itemName || name;

  const getImageUrl = (p) => {
    if (!p) return 'https://placehold.co/45x45/1e293b/94a3b8?text=NO+IMG';
    if (p.startsWith('data:image')) return p;
    const formattedPath = p.startsWith('/') ? p : `/${p}`;
    return `${SERVER_URL}${formattedPath}`;
  };

  const finalSrc = hasError ? 'https://placehold.co/45x45/1e293b/ef4444?text=ERR' : getImageUrl(path);

  return (
    <div
      className="position-relative d-flex align-items-center"
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={finalSrc} alt={label} className="sto-img-thumb" onError={() => setHasError(true)} />

      {isHovered && path && !hasError && (
        <div
          className="position-absolute rounded-3 overflow-hidden border"
          style={{
            left: '55px', top: '-20px', zIndex: 9999,
            background: 'var(--sto-bg-2)', borderColor: 'var(--sto-border)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          <img
            src={finalSrc}
            alt="Preview"
            style={{ maxWidth: '300px', maxHeight: '300px', display: 'block', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
};
