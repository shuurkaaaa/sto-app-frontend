import React from 'react';
import { useWorkers } from '../../Context/WorkersContext';
import { useOrders } from '../../Context/OrdersContext';

export const DashboardTable = ({ orders, onDelete, onEdit }) => {
  const { workers } = useWorkers();
  const { updateOrderStatus } = useOrders();

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    const clientName = order.customer?.name || order.client || 'Клієнт';
    const carInfo = order.carDetails || `${order.car} (${order.plate})`;
    const servicesRows = (order.services || []).map(s => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${s.price} грн</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><body style="font-family: sans-serif; padding: 20px;">
        <h2 style="text-align: center;">СТО "PRO-SERVICE"</h2>
        <hr/>
        <p><strong>Клієнт:</strong> ${clientName}</p>
        <p><strong>Авто:</strong> ${carInfo}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">${servicesRows}</table>
        <h3 style="text-align: right; margin-top: 20px;">РАЗОМ: ${order.totalPrice || 0} грн</h3>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING' || s === 'ОЧІКУЄ') return 'sto-status-pending';
    if (s === 'IN_WORK' || s === 'IN_PROGRESS' || s === 'В РОБОТІ') return 'sto-status-inwork';
    if (s === 'READY' || s === 'ГОТОВО') return 'sto-status-ready';
    return 'sto-status-done';
  };

  return (
    <div className="sto-table-card">
      <table className="sto-table">
        <thead>
          <tr>
            <th>Клієнт / Дата</th>
            <th>Автомобіль</th>
            <th>Майстер</th>
            <th>Статус</th>
            <th>Сума</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>
                <div className="fw-bold">{order.customer?.name || order.client}</div>
                <div className="sto-text-muted" style={{ fontSize: '11px' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td>
                <div>{order.carDetails || order.car}</div>
                {order.plate && (
                  <span
                    className="px-2 py-1 rounded-2"
                    style={{ fontSize: '10px', background: 'var(--sto-bg)' }}
                  >
                    {order.plate}
                  </span>
                )}
              </td>
              <td>
                <select
                  value={order.masterId || ''}
                  onChange={(e) => updateOrderStatus(order.id, { masterId: e.target.value ? parseInt(e.target.value) : null })}
                  className="sto-select"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                >
                  <option value="">Не призначено</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, { status: e.target.value })}
                  className={`sto-status ${getStatusClass(order.status)}`}
                >
                  <option value="PENDING">Очікує</option>
                  <option value="IN_WORK">В роботі</option>
                  <option value="READY">Готово</option>
                  <option value="COMPLETED">Виконано</option>
                </select>
              </td>
              <td>
                <strong className="sto-text-success">{order.totalPrice || 0} грн</strong>
              </td>
              <td>
                <div className="d-flex gap-1 w-100">
                  <button onClick={() => onEdit(order)} className="sto-btn-mini" style={{ flex: '1 1 auto' }}>Редагувати</button>
                  <button onClick={() => handlePrint(order)} className="sto-btn-mini" style={{ flex: '1 1 auto' }}>Друк</button>
                  <button onClick={() => onDelete(order.id)} className="sto-btn-mini sto-text-danger" style={{ flex: '1 1 auto' }}>Видалити</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
