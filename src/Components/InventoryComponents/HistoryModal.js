import React, { useState, useEffect } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';

const HistoryModal = ({ item, onClose }) => {
  const { getItemLogs } = useInventoryContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item?.id) {
      setLoading(true);
      getItemLogs(item.id)
        .then(data => { setLogs(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [item, getItemLogs]);

  if (!item) return null;

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal" style={{ width: '550px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0 text-light">Історія: {item.name}</h2>
          <button
            onClick={onClose}
            className="sto-text-muted"
            style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <hr className="sto-divider" />

        {loading ? (
          <p className="sto-text-muted text-center p-3">Завантаження логів...</p>
        ) : logs.length === 0 ? (
          <p className="sto-text-muted text-center p-3">Операцій ще не зафіксовано</p>
        ) : (
          <ul className="list-unstyled p-0">
            {logs.map(log => (
              <li
                key={log.id}
                className="p-2 mb-2 rounded-3"
                style={{
                  background: 'var(--sto-bg)',
                  borderLeft: `4px solid ${Number(log.amount) > 0 ? '#10B981' : '#EF4444'}`,
                }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <strong className="sto-text-muted small">
                    {new Date(log.date).toLocaleString('uk-UA')}
                  </strong>
                  <span
                    className={`fw-bold ${Number(log.amount) > 0 ? 'sto-text-success' : 'sto-text-danger'}`}
                  >
                    {Number(log.amount) > 0 ? `+${log.amount}` : log.amount} шт.
                  </span>
                </div>
                <p className="m-0 text-light">{log.note}</p>
              </li>
            ))}
          </ul>
        )}

        <button onClick={onClose} className="sto-btn sto-btn-primary w-100 mt-3">
          Закрити вікно
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;
