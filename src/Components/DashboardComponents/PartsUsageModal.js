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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Чек замовлення #{order.id}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer', color: '#ccc' }}>&times;</button>
        </div>

        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px', fontSize: '14px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong>Авто:</strong> {order.car} ({order.plate})</p>
          <p style={{ margin: 0 }}><strong>Майстер:</strong> {order.master}</p>
        </div>

        <div style={{ background: '#f0f7ff', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4338ca', fontSize: '13px' }}>Додати зі складу:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}
            >
              <option value="">-- Оберіть запчастину --</option>
              {items.map(item => (
                <option key={item.id} value={item.id} disabled={item.current <= 0}>
                  {item.name} ({item.current} шт.) — {item.price} грн
                </option>
              ))}
            </select>
            <button onClick={handleAdd} style={{ background: '#818CF8', color: 'white', border: 'none', width: '40px', borderRadius: '10px', cursor: 'pointer', fontSize: '20px' }}>+</button>
          </div>
        </div>

        <div style={{ flex: 1, maxHeight: '180px', overflowY: 'auto', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Використані матеріали:</h4>
          {order.usedParts?.length > 0 ? (
            order.usedParts.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{p.name}</span>
                <strong>{p.price} грн</strong>
              </div>
            ))
          ) : <p style={{ color: '#94a3b8', textAlign: 'center' }}>Поки нічого не додано</p>}
        </div>

        <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ color: '#64748b' }}>Разом до сплати:</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#818CF8' }}>{order.total} грн</span>
          </div>
          <button 
            onClick={onClose} 
            style={{ width: '100%', padding: '16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(34, 197, 94, 0.3)' }}
          >
            Підтвердити та закрити
          </button>
        </div>
      </div>
    </div>
  );
};