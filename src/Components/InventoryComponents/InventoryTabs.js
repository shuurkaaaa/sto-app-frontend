import React from 'react';

export const InventoryTabs = ({ activeTab, onTabChange, deficitCount }) => (
  <div className="mb-3 d-flex gap-2">
    <button
      className={`sto-tab ${activeTab === 'all' ? 'active' : ''}`}
      onClick={() => onTabChange('all')}
    >
      Усі товари
    </button>
    <button
      className={`sto-tab ${activeTab === 'deficit' ? 'active' : ''}`}
      onClick={() => onTabChange('deficit')}
    >
      Дефіцит ({deficitCount})
    </button>
  </div>
);
