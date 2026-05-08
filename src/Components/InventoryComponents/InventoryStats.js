import React from 'react';
import { inventoryStyles } from './InventoryStyles';

export const InventoryStats = ({ totalValue, deficitCount }) => (
  <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
    <div style={{ ...inventoryStyles.tableCard, flex: 1, padding: '20px', borderLeft: '5px solid #818CF8' }}>
      <div style={{ color: '#94A3B8', fontSize: '12px' }}>ВАРТІСТЬ ЗАЛИШКІВ</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px', color: '#F1F5F9' }}>{totalValue.toLocaleString()} грн</div>
    </div>
    <div style={{ ...inventoryStyles.tableCard, flex: 1, padding: '20px', borderLeft: '5px solid #F87171' }}>
      <div style={{ color: '#F87171', fontSize: '12px' }}>ПОЗИЦІЙ У ДЕФІЦИТІ</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px', color: '#F1F5F9' }}>{deficitCount} ШТ.</div>
    </div>
  </div>
);