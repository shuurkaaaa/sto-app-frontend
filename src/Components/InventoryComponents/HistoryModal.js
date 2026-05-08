import React, { useState, useEffect } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

const HistoryModal = ({ item, onClose }) => {
  const { getItemLogs } = useInventoryContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантажуємо свіжі логи щоразу, коли відкривається вікно для нового товару
  useEffect(() => {
    if (item?.id) {
      setLoading(true);
      getItemLogs(item.id)
        .then(data => {
          setLogs(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [item, getItemLogs]);

  if (!item) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '24px', 
        borderRadius: '12px', width: '550px', maxHeight: '85vh', 
        overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ margin: 0, color: '#1E293B' }}>Історія: {item.name}</h2>
          <button 
            onClick={onClose} 
            style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}
          >
            &times;
          </button>
        </div>
        
        <hr style={{ border: '0', borderTop: '1px solid #E2E8F0', marginBottom: '20px' }} />
        
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>Завантаження логів...</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>Операцій ще не зафіксовано</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.map((log) => (
              <li key={log.id} style={{ 
                padding: '12px', 
                marginBottom: '10px', 
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                borderLeft: `4px solid ${Number(log.amount) > 0 ? '#10B981' : '#EF4444'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#475569' }}>
                    {new Date(log.date).toLocaleString('uk-UA')}
                  </strong>
                  <span style={{ 
                    color: Number(log.amount) > 0 ? '#059669' : '#DC2626', 
                    fontWeight: 'bold' 
                  }}>
                    {Number(log.amount) > 0 ? `+${log.amount}` : log.amount} шт.
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1E293B' }}>{log.note}</p>
              </li>
            ))}
          </ul>
        )}
        
        <button 
          onClick={onClose}
          style={{ 
            marginTop: '20px', 
            width: '100%',
            padding: '12px', 
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#6366F1',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Закрити вікно
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;