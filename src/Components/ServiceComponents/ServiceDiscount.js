import React from 'react';

export const ServiceDiscount = ({ price, oldPrice }) => {
  if (!oldPrice) return <span className="sto-text-accent fw-bold">{price} грн</span>;

  return (
    <div className="d-flex flex-column align-items-end">
      <span className="sto-text-muted small text-decoration-line-through">{oldPrice} грн</span>
      <span className="sto-text-success fw-bold">{price} грн</span>
    </div>
  );
};
