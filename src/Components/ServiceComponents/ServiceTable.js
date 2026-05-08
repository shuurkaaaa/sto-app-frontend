import React, { useState } from 'react';
import { serviceStyles } from './ServiceStyles';
import { useOrders } from '../../Context/OrdersContext';
import { ServiceTime } from './ServiceTime';
import { ServiceDiscount } from './ServiceDiscount';
import { ServiceSuggestions } from './ServiceSuggestions';

export const ServiceTable = ({ services, onDelete, onUpdatePrice, onEdit }) => {
  const { orders } = useOrders();
  const [editingId, setEditingId] = useState(null);

  // Визначення популярності послуги (3+ замовлення)
  const isPopular = (serviceName) => {
    const count = orders.filter(o => 
      o.serviceName?.toLowerCase().includes(serviceName.toLowerCase())
    ).length;
    return count >= 3; 
  };

  return (
    <div style={serviceStyles.tableCard}>
      <table style={serviceStyles.table}>
        <thead>
          <tr>
            <th style={serviceStyles.th}>Назва послуги та рекомендації</th>
            <th style={serviceStyles.th}>Категорія</th>
            <th style={serviceStyles.th}>Вартість</th>
            <th style={{ ...serviceStyles.th, textAlign: 'center' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? (
            services.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={serviceStyles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', color: '#F1F5F9' }}>{s.name}</span>
                    {isPopular(s.name) && (
                      <span style={{ 
                        color: '#F59E0B', 
                        fontSize: '10px', 
                        fontWeight: 'bold', 
                        border: '1px solid #F59E0B', 
                        padding: '1px 4px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Популярне
                      </span>
                    )}
                    <ServiceTime time={s.time} />
                  </div>
                  
                  {/* Запчастини (якщо є в об'єкті) */}
                  {((s.parts || s.linkedParts) && (s.parts || s.linkedParts).length > 0) && (
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      📦 {(s.parts || s.linkedParts).map(p => p.name).join(', ')}
                    </div>
                  )}

                  <ServiceSuggestions serviceName={s.name} />
                </td>

                <td style={serviceStyles.td}>
                  <span style={serviceStyles.categoryBadge}>
                    {s.priceCategory ? s.priceCategory.name : (s.categoryName || s.category || 'Загальне')}
                  </span>
                </td>

                <td style={serviceStyles.tdPrice}>
                  {editingId === s.id ? (
                    <input 
                      autoFocus
                      type="number"
                      defaultValue={s.price}
                      onBlur={(e) => {
                        onUpdatePrice(s.id, e.target.value);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdatePrice(s.id, e.target.value);
                          setEditingId(null);
                        }
                      }}
                      style={{ 
                        width: '80px', 
                        padding: '5px', 
                        borderRadius: '4px', 
                        border: '1px solid #818CF8',
                        backgroundColor: '#0F172A',
                        color: '#F1F5F9'
                      }}
                    />
                  ) : (
                    <div 
                      onClick={() => setEditingId(s.id)} 
                      style={{ cursor: 'pointer', display: 'inline-block' }}
                    >
                      <ServiceDiscount price={s.price} oldPrice={s.oldPrice} />
                    </div>
                  )}
                </td>

                <td style={{ ...serviceStyles.td, textAlign: 'center' }}>
                  <button 
                    onClick={() => onEdit(s)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#818CF8', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      marginRight: '15px',
                      fontSize: '13px'
                    }}
                  >
                    Редагувати
                  </button>
                  <button 
                    onClick={() => onDelete(s.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#EF4444',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                За вашим запитом послуг не знайдено...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};