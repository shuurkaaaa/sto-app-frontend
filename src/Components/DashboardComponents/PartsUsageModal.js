import React, { useState } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';
import { useOrders } from '../../Context/OrdersContext';

export const PartsUsageModal = ({ isOpen, onClose, order }) => {
  const { items, reduceStockItem } = useInventoryContext();
  const { addPartToOrder } = useOrders();
  const [selectedId, setSelectedId] = useState('');

  if (!isOpen || !order) return null;

  const handleAdd = () => {
    if (!selectedId) return;
    const part = items.find(p => p.id === parseInt(selectedId));
    if (part) {
      reduceStockItem(part.id, 1);
      addPartToOrder(order.id, part);
      setSelectedId('');
    }
  };

  return (
    <div className="sto-modal-overlay" style={{ zIndex: 10000 }}>
      <div className="sto-modal" style={{ width: '450px' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0 text-light">Чек замовлення #{order.id}</h2>
          <button onClick={onClose} className="sto-text-muted" style={{ background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="sto-card-sm mb-3 small">
          <p className="m-0 mb-1">
            <strong>Авто:</strong>{' '}
            {order.carDetails || (typeof order.car === 'object' ? order.car?.name : order.car) || '—'}
            {order.plate ? ` (${order.plate})` : ''}
          </p>
          <p className="m-0">
            <strong>Майстер:</strong>{' '}
            {(typeof order.master === 'object' ? order.master?.name : order.master) || 'Не призначено'}
          </p>
        </div>

        <div className="sto-card-sm mb-3">
          <label className="sto-label sto-text-accent mb-2 d-block">Додати зі складу:</label>
          <div className="d-flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="sto-select flex-grow-1"
            >
              <option value="">-- Оберіть запчастину --</option>
              {items.map(item => (
                <option key={item.id} value={item.id} disabled={item.current <= 0}>
                  {item.name} ({item.current} шт.) — {item.price} грн
                </option>
              ))}
            </select>
            <button onClick={handleAdd} className="sto-btn sto-btn-primary" style={{ width: '40px', fontSize: '20px' }}>+</button>
          </div>
        </div>

        <div className="overflow-auto mb-3" style={{ maxHeight: '180px' }}>
          <h4 className="sto-text-muted m-0 mb-2">Використані матеріали:</h4>
          {(order.usedParts || order.parts)?.length > 0 ? (
            (order.usedParts || order.parts).map((p, i) => (
              <div key={i} className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid var(--sto-border)' }}>
                <span>{p.name}</span>
                <strong>{p.price} грн</strong>
              </div>
            ))
          ) : <p className="sto-text-dim text-center">Поки нічого не додано</p>}
        </div>

        <div className="pt-3" style={{ borderTop: '2px solid var(--sto-border)' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="sto-text-muted">Разом до сплати:</span>
            <span className="sto-text-accent fw-bold" style={{ fontSize: '26px' }}>{order.totalPrice ?? order.total ?? 0} грн</span>
          </div>
          <button onClick={onClose} className="sto-btn w-100 fw-bold text-white" style={{ background: '#22c55e', fontSize: '16px', padding: '16px' }}>
            Підтвердити та закрити
          </button>
        </div>
      </div>
    </div>
  );
};
