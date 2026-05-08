import React from 'react';

export const PrintSection = ({ items }) => {
  const deficitItems = items.filter(item => Number(item.current) <= Number(item.minimum));

  if (deficitItems.length === 0) return null;

  return (
    <>
      <style>
        {`
          @media screen {
            .print-only { display: none; }
          }
          @media print {
            body * { visibility: hidden; }
            .print-only, .print-only * { visibility: visible; }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
              color: black !important;
            }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; color: black; }
          }
        `}
      </style>
      
      <div className="print-section print-only" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ textAlign: 'center' }}>НАКЛАДНА НА ЗАКУПІВЛЮ</h1>
        <p>Дата: {new Date().toLocaleDateString('uk-UA')}</p>
        <table style={{ marginTop: '20px' }}>
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
        <p style={{ marginTop: '20px' }}>Всього позицій: {deficitItems.length}</p>
      </div>
    </>
  );
};