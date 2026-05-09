import React from 'react';

export const PrintSection = ({ items }) => {
  const deficitItems = items.filter(item => Number(item.current) <= Number(item.minimum));
  if (deficitItems.length === 0) return null;

  return (
    <div className="d-none d-print-block print-only" style={{ padding: '20px', fontFamily: 'sans-serif', color: 'black' }}>
      <h1 className="text-center">НАКЛАДНА НА ЗАКУПІВЛЮ</h1>
      <p>Дата: {new Date().toLocaleDateString('uk-UA')}</p>
      <table className="table table-bordered" style={{ marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Товар</th>
            <th>Артикул</th>
            <th>Кількість до замовлення</th>
            <th>Постачальник</th>
          </tr>
        </thead>
        <tbody>
          {deficitItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.stockKeepingUnit || item.sku}</td>
              <td>{Math.max(1, Number(item.minimum) - Number(item.current))} шт.</td>
              <td>{item.supplier || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3">Всього позицій: {deficitItems.length}</p>
    </div>
  );
};
