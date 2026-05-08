import React from 'react';

export const ServiceDiscount = ({ price, oldPrice }) => {
  if (!oldPrice) return <span style={{ color: '#818CF8', fontWeight: 'bold' }}>{price} грн</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '12px' }}>
        {oldPrice} грн
      </span>
      <span style={{ color: '#4ADE80', fontWeight: 'bold' }}>
        {price} грн
      </span>
    </div>
  );
};