import React from 'react';
import { useOrders } from '../../Context/OrdersContext';

export const ActiveOrderModal = ({ isOpen, onClose, orderId }) => {
  const { orders } = useOrders();
  if (!isOpen) return null;
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  const totalPartsPrice = order.usedParts?.reduce((acc, p) => acc + (Number(p.price) * (p.quantity || 1)), 0) || 0;
  const finalAmount = (Number(order.totalPrice) || 0) + totalPartsPrice;

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal" style={{ maxWidth: '400px' }}>
        <h2 className="text-light mb-3">Чек: {order.car}</h2>

        <div className="pb-3 mb-3" style={{ borderBottom: '1px dashed var(--sto-border)' }}>
          <div className="d-flex justify-content-between mb-2">
            <span className="sto-text-muted">Послуга:</span>
            <span className="text-light">{order.serviceName}</span>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="sto-text-muted">Вартість роботи:</span>
            <span className="text-light">{order.totalPrice} грн</span>
          </div>

          {order.usedParts && order.usedParts.length > 0 && (
            <div className="rounded-3 p-3" style={{ background: 'var(--sto-bg)' }}>
              <p className="sto-text-muted mb-2 small">Використані матеріали:</p>
              {order.usedParts.map((p, i) => (
                <div key={i} className="d-flex justify-content-between small mb-1" style={{ color: '#CBD5E1' }}>
                  <span>{p.name} (x{p.quantity || 1})</span>
                  <span>{p.price * (p.quantity || 1)} грн</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="sto-text-muted fw-bold">РАЗОМ ДО ОПЛАТИ:</span>
          <span className="sto-text-accent fw-bold" style={{ fontSize: '20px' }}>{finalAmount} грн</span>
        </div>

        <button onClick={onClose} className="sto-btn sto-btn-secondary w-100 mt-4">Закрити</button>
      </div>
    </div>
  );
};
