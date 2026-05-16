import React, { useState } from 'react';
import { InventoryImage } from './InventoryImage';
import { SmartCompatibility } from './SmartCompatibility';
import { InventoryActions } from './InventoryActions';
import { InventoryTechnicalSpecs } from './InventoryTechnicalSpecs';

export const InventoryTable = ({ items, onUpdateStock, onDelete, onEdit, onShowHistory, onTagClick }) => {
  const [actionData, setActionData] = useState(null);

  if (!Array.isArray(items) || items.length === 0) {
    return <div className="sto-text-muted text-center p-5">Склад порожній...</div>;
  }

  const renderCategory = (category) => {
    if (!category) return 'Без категорії';
    if (typeof category === 'object') return category.name || 'Категорія';
    return category;
  };

  return (
    <div className="sto-table-card">
      <table className="sto-table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Товар / Артикул</th>
            <th>Наявність</th>
            <th>Ціна</th>
            <th>Технічні характеристики</th>
            <th>Сумісність</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <InventoryImage source={item.imageSource} itemName={item.name} />
              </td>
              <td>
                <div className="fw-semibold text-light">{item.name}</div>
                <div className="sto-text-muted" style={{ fontSize: '11px' }}>
                  {item.stockKeepingUnit || 'Немає SKU'}
                </div>
                <span className="sto-text-accent d-inline-block mt-1" style={{ fontSize: '11px' }}>
                  {renderCategory(item.category)}
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <button onClick={() => setActionData({ item, operationMode: 'sell' })} className="sto-btn-mini sto-btn-icon-only">-</button>
                  <span className={`sto-stock-badge ${Number(item.current) <= Number(item.minimum) ? 'sto-stock-low' : 'sto-stock-ok'}`}>
                    {item.current ?? 0} шт
                  </span>
                  <button onClick={() => setActionData({ item, operationMode: 'add' })} className="sto-btn-mini sto-btn-icon-only">+</button>
                </div>
              </td>
              <td>
                <div className="text-light fw-bold">{item.price || 0} грн</div>
              </td>
              <td>
                <InventoryTechnicalSpecs technicalData={item.technicalData} />
              </td>
              <td>
                <SmartCompatibility compatibility={item.compatibility} onTagClick={onTagClick} />
              </td>
              <td>
                <div className="d-flex gap-2 w-100">
                  <button onClick={() => onShowHistory(item)} className="sto-btn-mini" style={{ flex: '1 1 auto' }}>Історія</button>
                  <button onClick={() => onEdit(item)} className="sto-btn-mini sto-text-accent" style={{ flex: '1 1 auto' }}>Ред.</button>
                  <button onClick={() => onDelete(item.id)} className="sto-btn-mini sto-text-danger" style={{ flex: '1 1 auto' }}>Вид.</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {actionData && (
        <InventoryActions
          inventoryItem={actionData.item}
          operationMode={actionData.operationMode}
          onClose={() => setActionData(null)}
          onConfirm={(amount, note) => {
            onUpdateStock(actionData.item.id, amount, note);
            setActionData(null);
          }}
        />
      )}
    </div>
  );
};
