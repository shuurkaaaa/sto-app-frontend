import React from 'react';

export const CustomerHeader = ({ onAddClick }) => (
  <div className="d-flex justify-content-between align-items-center w-100">
    <h1 className="m-0 fw-bold" style={{ fontSize: '28px', color: '#F8FAFC' }}>
      Клієнтська база
    </h1>
    <button onClick={onAddClick} className="sto-btn sto-btn-primary">
      + НОВИЙ КЛІЄНТ
    </button>
  </div>
);
