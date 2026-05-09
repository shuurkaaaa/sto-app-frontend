import React, { useState } from 'react';

export const AssignCarModal = ({ isOpen, onClose, onConfirm, pendingOrders = [] }) => {
  const [selectedOrderId, setSelectedOrderId] = useState('');
  if (!isOpen) return null;

  const getCarLabel = (o) =>
    o.carDetails || [o.car, o.plate].filter(Boolean).join(' — ') || `Замовлення #${o.id}`;

  const handleConfirm = () => {
    const order = pendingOrders.find(o => String(o.id) === String(selectedOrderId));
    if (!order) return alert('Оберіть замовлення');
    onConfirm(getCarLabel(order), order.id);
    setSelectedOrderId('');
    onClose();
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 2000 }}>
      <div className="sto-modal" style={{ maxWidth: '380px', padding: '30px' }}>
        <h3 className="mt-0 text-center text-light">Призначити замовлення</h3>

        <select
          className="sto-input my-4"
          value={selectedOrderId}
          onChange={(e) => setSelectedOrderId(e.target.value)}
        >
          <option value="">— Оберіть автомобіль —</option>
          {pendingOrders.length === 0 && (
            <option value="" disabled>Немає замовлень в очікуванні</option>
          )}
          {pendingOrders.map(o => (
            <option key={o.id} value={o.id}>
              {getCarLabel(o)}
            </option>
          ))}
        </select>

        <div className="d-flex gap-2">
          <button onClick={onClose} className="sto-btn sto-btn-ghost flex-grow-1">Скасувати</button>
          <button
            disabled={!selectedOrderId}
            onClick={handleConfirm}
            className="sto-btn sto-btn-primary flex-grow-1"
            style={{ opacity: selectedOrderId ? 1 : 0.5 }}
          >
            В роботу
          </button>
        </div>
      </div>
    </div>
  );
};
