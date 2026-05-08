import React, { useState } from 'react';
import { dashboardStyles } from './DashboardStyles';
import { PartsUsageModal } from './PartsUsageModal'; 
import { useWorkers } from '../../Context/WorkersContext';
import { useOrders } from '../../Context/OrdersContext';

export const DashboardTable = ({ orders, onDelete, onEdit }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      <html>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2 style="text-align: center;">СТО "PRO-SERVICE"</h2>
          <hr/>
          <p><strong>Клієнт:</strong> ${clientName}</p>
          <p><strong>Авто:</strong> ${carInfo}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">${servicesRows}</table>
          <h3 style="text-align: right; margin-top: 20px;">РАЗОМ: ${order.totalPrice || 0} грн</h3>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const actionBtnStyle = {
    background: 'transparent', 
    border: '1px solid #334155', 
    cursor: 'pointer', 
    padding: '5px 10px', 
    borderRadius: '6px', 
    color: '#94A3B8',
    fontSize: '12px'
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === 'PENDING' || s === 'ОЧІКУЄ') return dashboardStyles.statusPending;
    if (s === 'IN_WORK' || s === 'IN_PROGRESS' || s === 'В РОБОТІ') return dashboardStyles.statusInWork;
    if (s === 'READY' || s === 'ГОТОВО') return dashboardStyles.statusReady;
    return dashboardStyles.statusDone;
  };

  const handleMasterChange = (orderId, masterId) => {
    updateOrderStatus(orderId, { masterId: masterId ? parseInt(masterId) : null });
  };

  const handleStatusChange = (orderId, status) => {
    updateOrderStatus(orderId, { status });
  };

  return (
    <div style={dashboardStyles.tableCard}>
      <table style={dashboardStyles.table}>
        <thead>
          <tr>
            <th style={dashboardStyles.th}>Клієнт / Дата</th>
            <th style={dashboardStyles.th}>Автомобіль</th>
            <th style={dashboardStyles.th}>Майстер</th>
            <th style={dashboardStyles.th}>Статус</th>
            <th style={dashboardStyles.th}>Сума</th>
            <th style={dashboardStyles.th}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={dashboardStyles.tr}>
              <td style={dashboardStyles.td}>
                <div style={{fontWeight: 'bold'}}>{order.customer?.name || order.client}</div>
                <div style={{fontSize: '11px', color: '#94A3B8'}}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td style={dashboardStyles.td}>
                <div>{order.carDetails || order.car}</div>
                {order.plate && (
                   <span style={{fontSize: '10px', background: '#0F172A', padding: '2px 5px', borderRadius: '4px'}}>{order.plate}</span>
                )}
              </td>
              <td style={dashboardStyles.td}>
                <select 
                  value={order.masterId || ""} 
                  onChange={(e) => handleMasterChange(order.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '13px',
                    backgroundColor: '#0F172A',
                    color: '#F1F5F9'
                  }}
                >
                  <option value="">Не призначено</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </td>
              <td style={dashboardStyles.td}>
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={getStatusStyle(order.status)}
                >
                  <option value="PENDING">Очікує</option>
                  <option value="IN_WORK">В роботі</option>
                  <option value="READY">Готово</option>
                  <option value="COMPLETED">Виконано</option>
                </select>
              </td>
              <td style={dashboardStyles.td}>
                <strong style={{color: '#4ADE80'}}>{order.totalPrice || 0} грн</strong>
              </td>
              <td style={dashboardStyles.td}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => setSelectedOrder(order)} style={actionBtnStyle}>Запчастини</button>
                  <button onClick={() => onEdit(order)} style={actionBtnStyle}>Редагувати</button>
                  <button onClick={() => handlePrint(order)} style={actionBtnStyle}>Друк</button>
                  <button onClick={() => onDelete(order.id)} style={{...actionBtnStyle, color: '#f87171'}}>Видалити</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedOrder && <PartsUsageModal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} order={selectedOrder} />}
    </div>
  );
};