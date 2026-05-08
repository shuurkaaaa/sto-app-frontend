import React from 'react';
import { inventoryStyles } from './InventoryStyles';

export const InventoryTabs = ({ activeTab, onTabChange, deficitCount }) => (
  <div style={{ marginBottom: '20px', display: 'flex' }}>
    <button 
      style={inventoryStyles.tab(activeTab === 'all')} 
      onClick={() => onTabChange('all')}
    >
      Усі товари
    </button>
    <button 
      style={inventoryStyles.tab(activeTab === 'deficit')} 
      onClick={() => onTabChange('deficit')}
    >
      Дефіцит ({deficitCount})
    </button>
  </div>
);