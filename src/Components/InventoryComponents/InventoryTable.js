import React, { useState } from 'react';
import { inventoryStyles } from './InventoryStyles';
import { InventoryImage } from './InventoryImage';
import { SmartCompatibility } from './SmartCompatibility';
import { InventoryActions } from './InventoryActions';

export const InventoryTable = ({ items, onUpdateStock, onDelete, onEdit, onShowHistory, onTagClick }) => {
  const [actionData, setActionData] = useState(null);

  if (!Array.isArray(items) || items.length === 0) {
    return <div style={{color: '#94A3B8', textAlign: 'center', padding: '40px'}}>Склад порожній...</div>;
  }

  const renderCategory = (category) => {
    if (!category) return 'Без категорії';
    if (typeof category === 'object') return category.name || 'Категорія';
    return category;
  };

  return (
    <div style={inventoryStyles.tableCard}>
      <table style={inventoryStyles.table}>
        <thead>
          <tr>
            <th style={inventoryStyles.tableHeader}>Фото</th>
            <th style={inventoryStyles.tableHeader}>Товар / Артикул</th>
            <th style={inventoryStyles.tableHeader}>Наявність</th>
            <th style={inventoryStyles.tableHeader}>Ціна</th>
            <th style={inventoryStyles.tableHeader}>Сумісність</th>
            <th style={inventoryStyles.tableHeader}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={inventoryStyles.tableData}>
                <InventoryImage source={item.imageSource} itemName={item.name} />
              </td>
              <td style={inventoryStyles.tableData}>
                <div style={{ fontWeight: '600', color: '#F1F5F9' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.stockKeepingUnit || 'Немає SKU'}</div>
                <span style={{ marginTop: '5px', display: 'inline-block', fontSize: '11px', color: '#818CF8' }}>
                  {renderCategory(item.category)}
                </span>
              </td>
              <td style={inventoryStyles.tableData}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setActionData({ item, operationMode: 'sell' })} style={inventoryStyles.miniButton}>-</button>
                  <span style={inventoryStyles.stockBadge(item.current, item.minimum)}>{item.current ?? 0} шт</span>
                  <button onClick={() => setActionData({ item, operationMode: 'add' })} style={inventoryStyles.miniButton}>+</button>
                </div>
              </td>
              <td style={inventoryStyles.tableData}>
                <div style={{ fontWeight: 'bold', color: '#F1F5F9' }}>{item.price || 0} грн</div>
              </td>
              <td style={inventoryStyles.tableData}>
                {/* Тепер тут завжди буде або список тегів, або "Універсальне" */}
                <SmartCompatibility compatibility={item.compatibility} onTagClick={onTagClick} />
              </td>
              <td style={inventoryStyles.tableData}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onShowHistory(item)} style={{...inventoryStyles.actionButton, color: '#94A3B8'}}>Історія</button>
                  <button onClick={() => onEdit(item)} style={{...inventoryStyles.actionButton, color: '#818CF8'}}>Ред.</button>
                  <button onClick={() => onDelete(item.id)} style={{...inventoryStyles.actionButton, color: '#F87171'}}>Вид.</button>
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