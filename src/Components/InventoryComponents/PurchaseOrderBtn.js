import React, { useState } from 'react';
import axios from 'axios';
import { inventoryStyles } from './InventoryStyles';
import { exportToExcel } from './ExportLogic';

export const PurchaseOrderBtn = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Фільтруємо товари, де наявність менша або рівна мінімуму
  const deficitItems = items.filter(i => Number(i.current) <= Number(i.minimum));

  // Формування максимально простого тексту без зайвих символів
  const generateFullInvoiceText = () => {
    const dateStr = new Date().toLocaleDateString('uk-UA');
    let text = `НАКЛАДНА НА ЗАКУПІВЛЮ (${dateStr})\n\n`;

    deficitItems.forEach((item, index) => {
      const qtyToOrder = Math.max(1, Number(item.minimum) - Number(item.current));
      const sku = item.stockKeepingUnit || item.sku || '—';
      
      text += `${index + 1}. ${item.name}\n`;
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
        return sum + (qty * Number(item.price || 0));
      }, 0);

      await axios.post('http://localhost:5000/api/purchase/create', {
        items: deficitItems,
        totalPrice: calculatedTotal,
        status: 'Pending'
      });
    } catch (error) {
      console.error("Помилка БД:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    if (deficitItems.length === 0) return;

    const invoiceText = generateFullInvoiceText();

    if (type === 'print') {
      window.print();
    } else {
      // Копіюємо текст у буфер обміну для швидкої вставки (Cmd+V)
      navigator.clipboard.writeText(invoiceText).then(() => {
        if (type === 'telegram') {
          // Прямий перехід у додаток без зайвих вкладок у браузері
          window.location.href = "tg://msg"; 
        } else if (type === 'viber') {
          window.location.href = `viber://forward?text=${encodeURIComponent(invoiceText)}`;
        }
      });

      saveOrderToDb();
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        style={{
          ...inventoryStyles.purchaseButton, 
          opacity: deficitItems.length === 0 ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center'
        }} 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        {loading ? 'ОБРОБКА...' : 'ЗАМОВИТИ'}
        {deficitItems.length > 0 && (
          <span style={{ 
            marginLeft: '8px', backgroundColor: '#EF4444', 
            padding: '2px 8px', borderRadius: '10px', fontSize: '11px', color: 'white'
          }}>
            {deficitItems.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={inventoryStyles.dropdownMenu}>
          <div style={{ padding: '10px 12px', fontSize: '11px', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
            ОБЕРІТЬ КАНАЛ:
          </div>
          <button style={inventoryStyles.menuItem} onClick={() => handleAction('viber')}>Viber</button>
          <button style={inventoryStyles.menuItem} onClick={() => handleAction('telegram')}>Telegram</button>
          <button style={inventoryStyles.menuItem} onClick={() => { exportToExcel(items); setIsOpen(false); }}>Excel</button>
          <button style={inventoryStyles.menuItem} onClick={() => handleAction('print')}>Друк (PDF)</button>
        </div>
      )}
    </div>
  );
};