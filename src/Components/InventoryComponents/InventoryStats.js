import React from 'react';

export const InventoryStats = ({ totalValue, deficitCount }) => (
  <div className="d-flex gap-3 mb-4">
    <div className="sto-card flex-grow-1" style={{ borderLeft: '5px solid #818CF8' }}>
      <div className="sto-text-muted small">ВАРТІСТЬ ЗАЛИШКІВ</div>
      <div className="text-light fw-bold mt-1" style={{ fontSize: '24px' }}>{totalValue.toLocaleString()} грн</div>
    </div>
    <div className="sto-card flex-grow-1" style={{ borderLeft: '5px solid #F87171' }}>
      <div className="sto-text-danger small">ПОЗИЦІЙ У ДЕФІЦИТІ</div>
      <div className="text-light fw-bold mt-1" style={{ fontSize: '24px' }}>{deficitCount} ШТ.</div>
    </div>
  </div>
);
