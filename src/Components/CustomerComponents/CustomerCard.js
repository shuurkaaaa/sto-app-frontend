import React from 'react';

export const CustomerCard = ({ customer, onClick }) => {
  return (
    <div
      className="sto-card sto-card-clickable position-relative"
      style={customer.isVip ? { borderColor: '#fbbf24' } : undefined}
      onClick={() => onClick(customer.id)}
    >
      {customer.isVip && (
        <div
          className="position-absolute fw-bold rounded-3 px-2 py-1 text-white"
          style={{ top: '-10px', right: '10px', background: '#fbbf24', fontSize: '10px' }}
        >
          VIP
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h3 className="m-0 mb-1 text-light" style={{ fontSize: '18px' }}>{customer.name}</h3>
          <div className="small" style={{ color: '#64748b' }}>{customer.phone}</div>
        </div>
        <div className="text-end">
          <div className="fw-bold" style={{ color: '#3b82f6' }}>{customer.totalSpent} грн</div>
          <small className="sto-text-muted">{customer.source}</small>
        </div>
      </div>

      <div className="mt-3 pt-2 d-flex gap-2 flex-wrap" style={{ borderTop: '1px solid var(--sto-border)' }}>
        {customer.cars && customer.cars.map((car, idx) => (
          <span
            key={idx}
            className="text-light px-2 py-1 rounded-2 border small"
            style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)', fontSize: '12px' }}
          >
            {car.plate}
          </span>
        ))}
      </div>
    </div>
  );
};
