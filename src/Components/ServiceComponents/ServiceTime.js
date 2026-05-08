import React from 'react';

export const ServiceTime = ({ time }) => {
  if (!time) return null;
  return (
    <span style={{ 
      fontSize: '11px', 
      color: '#94A3B8', 
      backgroundColor: '#0F172A', 
      padding: '2px 6px', 
      borderRadius: '4px',
      marginLeft: '8px' 
    }}>
      {time} хв.
    </span>
  );
};