import React, { useState } from 'react';
import { exportToExcel } from './ExportLogic';
import { apiClient } from '../../services/apiClient';

export const PurchaseOrderBtn = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deficitItems = items.filter(i => Number(i.current) <= Number(i.minimum));

  const generateFullInvoiceText = () => {
    const dateStr = new Date().toLocaleDateString('uk-UA');
    let text = `НАКЛАДНА НА ЗАКУПІВЛЮ (${dateStr})\n\n`;
    deficitItems.forEach((item, idx) => {
      const qtyToOrder = Math.max(1, Number(item.minimum) - Number(item.current));
      const sku = item.stockKeepingUnit || item.sku || '—';
      text += `${idx + 1}. ${item.name}\n`;
      text += `Артикул: ${sku}\n`;
      text += `Замовити: ${qtyToOrder} шт. (Залишок: ${item.current})\n`;
      if (item.supplier) text += `Постачальник: ${item.supplier}\n`;
      text += `\n`;
    });
    text += `Всього позицій: ${deficitItems.length}`;
    return text;
  };

  const saveOrderToDb = async () => {
    if (deficitItems.length === 0) return;
    try {
      setLoading(true);
      const calculatedTotal = deficitItems.reduce((sum, item) => {
        const qty = Math.max(1, Number(item.minimum) - Number(item.current));
        return sum + qty * Number(item.price || 0);
      }, 0);
      await apiClient.post('/purchase/create', {
        items: deficitItems, totalPrice: calculatedTotal, status: 'Pending',
      });
    } catch (e) { console.error('Помилка БД:', e.message); } finally { setLoading(false); }
  };

  const handleAction = (type) => {
    if (deficitItems.length === 0) return;
    const invoiceText = generateFullInvoiceText();
    if (type === 'print') {
      window.print();
    } else {
      navigator.clipboard.writeText(invoiceText).then(() => {
        if (type === 'telegram') window.location.href = 'tg://msg';
        else if (type === 'viber') window.location.href = `viber://forward?text=${encodeURIComponent(invoiceText)}`;
      });
      saveOrderToDb();
    }
    setIsOpen(false);
  };

  return (
    <div className="position-relative">
      <button
        className="sto-btn sto-btn-secondary d-flex align-items-center"
        style={{ opacity: deficitItems.length === 0 ? 0.6 : 1 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        {loading ? 'ОБРОБКА...' : 'ЗАМОВИТИ'}
        {deficitItems.length > 0 && (
          <span
            className="ms-2 px-2 py-1 rounded-3 text-white"
            style={{ background: '#EF4444', fontSize: '11px' }}
          >
            {deficitItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="sto-dropdown">
          <div className="sto-text-muted small p-2" style={{ borderBottom: '1px solid var(--sto-border)' }}>
            ОБЕРІТЬ КАНАЛ:
          </div>
          <button className="sto-dropdown-item" onClick={() => handleAction('viber')}>Viber</button>
          <button className="sto-dropdown-item" onClick={() => handleAction('telegram')}>Telegram</button>
          <button className="sto-dropdown-item" onClick={() => { exportToExcel(items); setIsOpen(false); }}>Excel</button>
          <button className="sto-dropdown-item" onClick={() => handleAction('print')}>Друк (PDF)</button>
        </div>
      )}
    </div>
  );
};
