import React from 'react';
import { useOrders } from '../Context/OrdersContext';

export const ActiveOrderModal = ({ isOpen, onClose, orderId }) => {
  const { orders } = useOrders();

  if (!isOpen) return null;
  
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  // Рахуємо суму запчастин з урахуванням кількості
  const totalPartsPrice = order.usedParts?.reduce((acc, p) => {
    return acc + (Number(p.price) * (p.quantity || 1));
  }, 0) || 0;

  const finalAmount = (Number(order.totalPrice) || 0) + totalPartsPrice;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ color: '#F1F5F9', marginBottom: '20px' }}>Чек: {order.car}</h2>
        
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: '#94A3B8' }}>Послуга:</span>
            <span style={{ color: '#F1F5F9' }}>{order.serviceName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ color: '#94A3B8' }}>Вартість роботи:</span>
            <span style={{ color: '#F1F5F9' }}>{order.totalPrice} грн</span>
          </div>

          {order.usedParts && order.usedParts.length > 0 && (
            <div style={styles.partsList}>
              <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '8px' }}>Використані матеріали:</p>
              {order.usedParts.map((p, i) => (
                <div key={i} style={styles.partItem}>
                  <span style={{ color: '#CBD5E1' }}>{p.name} (x{p.quantity || 1})</span>
                  <span style={{ color: '#CBD5E1' }}>{p.price * (p.quantity || 1)} грн</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <span style={{ color: '#94A3B8', fontWeight: 'bold' }}>РАЗОМ ДО ОПЛАТИ:</span>
          <span style={styles.total}>{finalAmount} грн</span>
        </div>

        <button onClick={onClose} style={styles.closeButton}>
          Закрити
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
  },
  modal: { 
    backgroundColor: '#1E293B', padding: '30px', borderRadius: '16px', 
    width: '400px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' 
  },
  section: { marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #334155' },
  partsList: { background: '#0F172A', padding: '12px', borderRadius: '8px' },
  partItem: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' },
  total: { color: '#818CF8', fontSize: '20px', fontWeight: 'bold' },
  closeButton: { 
    marginTop: '25px', width: '100%', padding: '12px', borderRadius: '8px', 
    backgroundColor: '#334155', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600' 
  }
};