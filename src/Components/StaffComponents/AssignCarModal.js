import React, { useState } from 'react';

export const AssignCarModal = ({ isOpen, onClose, onConfirm, pendingOrders = [] }) => {
  const [selectedOrderId, setSelectedOrderId] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const order = pendingOrders.find(o => o.id.toString() === selectedOrderId);
    if (!order) return alert("Оберіть замовлення");
    onConfirm(`${order.car} (${order.plate})`, order.id);
    setSelectedOrderId('');
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }}>
      <div style={{ background: '#1E293B', padding: '30px', borderRadius: '24px', width: '380px', boxShadow: '0 20px 25px rgba(0,0,0,0.3)', border: '1px solid #334155' }}>
        <h3 style={{ marginTop: 0, textAlign: 'center', color: '#F1F5F9' }}>Призначити замовлення</h3>
        
        <select 
          style={{ width: '100%', padding: '12px', margin: '20px 0', borderRadius: '12px', border: '1px solid #334155', fontSize: '15px', backgroundColor: '#0F172A', color: '#F1F5F9' }}
          value={selectedOrderId}
          onChange={(e) => setSelectedOrderId(e.target.value)}
        >
          <option value="">— Оберіть автомобіль —</option>
          {pendingOrders.map(o => (
            <option key={o.id} value={o.id}>
              {o.car} — {o.plate}
            </option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}>
            Скасувати
          </button>
          <button 
            disabled={!selectedOrderId}
            onClick={handleConfirm} 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#818CF8', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: selectedOrderId ? 1 : 0.5 }}
          >
            В роботу
          </button>
        </div>
      </div>
    </div>
  );
};