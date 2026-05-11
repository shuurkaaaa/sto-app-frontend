import React from 'react';

export const ServiceHistoryModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const orders = customer.orders || [];
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.completedAt || a.createdAt);
    const dateB = new Date(b.completedAt || b.createdAt);
    return dateB - dateA;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'Завершено':
        return '#10b981';
      case 'IN_WORK':
      case 'В роботі':
        return '#3b82f6';
      case 'READY':
      case 'Готово':
        return '#f59e0b';
      case 'PENDING':
      case 'Очікування':
        return '#6b7280';
      case 'CANCELLED':
      case 'Скасовано':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'COMPLETED': 'Завершено',
      'Завершено': 'Завершено',
      'IN_WORK': 'В роботі',
      'В роботі': 'В роботі',
      'READY': 'Готово',
      'Готово': 'Готово',
      'PENDING': 'Очікування',
      'Очікування': 'Очікування',
      'CANCELLED': 'Скасовано',
      'Скасовано': 'Скасовано',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDaysSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div
        className="sto-modal sto-modal-lg"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="m-0 text-light">{customer.name}</h2>
            <small className="sto-text-muted">Історія обслуговування</small>
          </div>
          <button
            onClick={onClose}
            className="sto-text-muted"
            style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="text-center py-5">
            <p className="sto-text-muted mb-0">Немає історії обслуговування</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {sortedOrders.map((order) => {
              const serviceDate = order.completedAt || order.createdAt;
              const daysSince = calculateDaysSince(serviceDate);
              const services = order.services || [];

              return (
                <div
                  key={order.id}
                  className="p-3 rounded-3"
                  style={{
                    background: 'var(--sto-bg)',
                    border: '1px solid var(--sto-border)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="d-flex gap-2 align-items-center mb-1">
                        <span
                          className="px-2 py-1 rounded-2 text-white small fw-bold"
                          style={{ background: getStatusColor(order.status) }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="sto-text-muted small">
                          {formatDate(serviceDate)}
                        </span>
                      </div>
                      <span className="sto-text-muted small d-block">
                        {daysSince === 0 ? 'Сьогодні' : `${daysSince} днів тому`}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-light" style={{ fontSize: '16px' }}>
                        {order.totalPrice ? `${order.totalPrice} грн` : '0 грн'}
                      </div>
                      {order.masterId && (
                        <small className="sto-text-muted d-block">
                          Майстер ID: {order.masterId}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Автомобіль */}
                  {order.carDetails && (
                    <div className="mb-2 p-2 rounded-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <small className="sto-text-muted d-block mb-1">Автомобіль:</small>
                      <span className="text-light small">{order.carDetails}</span>
                    </div>
                  )}

                  {/* Послуги */}
                  {services.length > 0 && (
                    <div className="mb-2">
                      <small className="sto-text-muted d-block mb-2">Послуги:</small>
                      <div className="d-flex flex-column gap-1">
                        {services.map((service, idx) => (
                          <div
                            key={`${order.id}-service-${idx}`}
                            className="d-flex justify-content-between align-items-center p-2 rounded-2"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >
                            <span className="text-light small">{service.name}</span>
                            {service.price && (
                              <span className="sto-text-muted small">{service.price} грн</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Примітки */}
                  {order.notes && (
                    <div className="mt-2 p-2 rounded-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <small className="sto-text-muted d-block mb-1">Примітки:</small>
                      <span className="text-light small">{order.notes}</span>
                    </div>
                  )}

                  {/* Спосіб оплати */}
                  {order.paymentMethod && (
                    <div className="mt-2">
                      <small className="sto-text-muted d-block">
                        Спосіб оплати: <span className="text-light">{order.paymentMethod}</span>
                      </small>
                    </div>
                  )}

                  {/* Екстрене */}
                  {order.isUrgent && (
                    <div className="mt-2">
                      <span
                        className="px-2 py-1 rounded-2 text-white small fw-bold"
                        style={{ background: '#ef4444' }}
                      >
                        ⚡ Екстрене
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4">
          <button onClick={onClose} className="sto-btn sto-btn-secondary w-100">
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
