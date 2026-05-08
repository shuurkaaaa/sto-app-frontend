import React, { useState } from 'react';
import { inventoryStyles } from './InventoryStyles';

export const InventoryImage = ({ src, name }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Використовуємо 127.0.0.1 замість localhost для уникнення проблем з SSL у Safari
  const SERVER_URL = "http://127.0.0.1:5000";

  const getImageUrl = (path) => {
    // Замінено на placehold.co, щоб уникнути помилок SSL (45, line 0)
    if (!path) return "https://placehold.co/45x45/1e293b/94a3b8?text=📦";
    
    // Якщо це base64
    if (path.startsWith('data:image')) {
      return path;
    }
    
    // Якщо це відносний шлях з бази (наприклад, uploads/file.jpg)
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_URL}${formattedPath}`;
  };

  // Заглушка на випадок помилки завантаження
  const finalSrc = hasError ? "https://placehold.co/45x45/1e293b/ef4444?text=ERR" : getImageUrl(src);

  return (
    <div 
      style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={finalSrc} 
        alt={name} 
        style={inventoryStyles.imageThumbnail} 
        onError={() => setHasError(true)}
      />
      
      {isHovered && src && !hasError && (
        <div style={{
          position: 'absolute',
          left: '55px',
          top: '-20px',
          zIndex: 9999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1E293B',
          border: '1px solid #334155'
        }}>
          <img 
            src={finalSrc} 
            alt="Preview" 
            style={{ 
              maxWidth: '300px', 
              maxHeight: '300px', 
              display: 'block',
              objectFit: 'contain'
            }} 
          />
        </div>
      )}
    </div>
  );
};