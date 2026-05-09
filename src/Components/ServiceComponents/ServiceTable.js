import React, { useState } from 'react';
import { useOrders } from '../../Context/OrdersContext';
import { ServiceTime } from './ServiceTime';
import { ServiceDiscount } from './ServiceDiscount';
import { ServiceSuggestions } from './ServiceSuggestions';

export const ServiceTable = ({ services, onDelete, onUpdatePrice, onEdit }) => {
  const { orders } = useOrders();
  const [editingId, setEditingId] = useState(null);

  const isPopular = (serviceName) => {
    const count = orders.filter(o => o.serviceName?.toLowerCase().includes(serviceName.toLowerCase())).length;
    return count >= 3;
  };

  return (
    <div className="sto-table-card">
      <table className="sto-table">
        <thead>
          <tr>
            <th>Назва послуги та рекомендації</th>
            <th>Категорія</th>
            <th>Вартість</th>
            <th className="text-center">Дії</th>
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? (
            services.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="text-light fw-semibold">{s.name}</span>
                    {isPopular(s.name) && (
                      <span
                        className="text-uppercase fw-bold rounded-1"
                        style={{ color: '#F59E0B', fontSize: '10px', border: '1px solid #F59E0B', padding: '1px 4px' }}
                      >
                        Популярне
                      </span>
                    )}
                    <ServiceTime time={s.time} />
                  </div>

                  {((s.parts || s.linkedParts) && (s.parts || s.linkedParts).length > 0) && (
                    <div className="sto-text-dim small mt-1">
                      📦 {(s.parts || s.linkedParts).map(p => p.name).join(', ')}
                    </div>
                  )}

                  <ServiceSuggestions serviceName={s.name} />
                </td>

                <td>
                  <span className="sto-badge-category">
                    {s.priceCategory ? s.priceCategory.name : (s.categoryName || s.category || 'Загальне')}
                  </span>
                </td>

                <td className="sto-td-price">
                  {editingId === s.id ? (
                    <input
                      autoFocus
                      type="number"
                      defaultValue={s.price}
                      onBlur={(e) => { onUpdatePrice(s.id, e.target.value); setEditingId(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { onUpdatePrice(s.id, e.target.value); setEditingId(null); } }}
                      className="sto-input"
                      style={{ width: '80px', borderColor: 'var(--sto-accent)' }}
                    />
                  ) : (
                    <div onClick={() => setEditingId(s.id)} style={{ cursor: 'pointer', display: 'inline-block' }}>
                      <ServiceDiscount price={s.price} oldPrice={s.oldPrice} />
                    </div>
                  )}
                </td>

                <td className="text-center">
                  <button onClick={() => onEdit(s)} className="btn btn-sm sto-text-accent fw-semibold me-3" style={{ background: 'none', border: 'none', fontSize: '13px' }}>
                    Редагувати
                  </button>
                  <button onClick={() => onDelete(s.id)} className="btn btn-sm sto-text-danger fw-semibold" style={{ background: 'none', border: 'none', fontSize: '13px' }}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center sto-text-muted py-5">
                За вашим запитом послуг не знайдено...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
