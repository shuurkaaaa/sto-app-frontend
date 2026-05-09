import React, { useState } from 'react';
import { useInventoryLogic } from '../Components/InventoryComponents/useInventoryLogic';
import { InventoryHeader } from '../Components/InventoryComponents/InventoryHeader';
import { InventoryStats } from '../Components/InventoryComponents/InventoryStats';
import { InventoryToolbar } from '../Components/InventoryComponents/InventoryToolbar';
import { InventoryTable } from '../Components/InventoryComponents/InventoryTable';
import { InventoryAddScreen } from '../Components/InventoryComponents/InventoryAddScreen';
import { PurchaseOrderBtn } from '../Components/InventoryComponents/PurchaseOrderBtn';
import { EditItemModal } from '../Components/InventoryComponents/EditItemModal';
import HistoryModal from '../Components/InventoryComponents/HistoryModal';
import { PrintSection } from '../Components/InventoryComponents/PrintSection';
import { CategoryFilters } from '../Components/InventoryComponents/CategoryFilters';
import { CarManagerModal } from '../Components/InventoryComponents/CarManagerModal';
import { useInventoryContext } from '../Context/InventoryContext';

const Inventory = () => {
  const {
    filteredItems, searchTerm, setSearchTerm, currentView, setCurrentView,
    selectedCategory, setSelectedCategory, showLowStock, setShowLowStock,
    stats, updateStock, fetchInventory, deleteItem,
  } = useInventoryLogic();

  const { updateItem, items } = useInventoryContext();

  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [isCarManagerOpen, setIsCarManagerOpen] = useState(false);

  const handleSaveEdit = async (formData) => {
    try {
      if (!editingItem?.id) { alert('Помилка: ID товару втрачено.'); return; }
      await updateItem(editingItem.id, formData);
      setEditingItem(null);
    } catch (error) {
      console.error('Помилка при збереженні змін:', error);
      alert('Не вдалося оновити товар.');
    }
  };

  return (
    <div className="sto-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <InventoryHeader />
        <div className="d-flex gap-2">
          <button
            onClick={() => setIsCarManagerOpen(true)}
            className="sto-btn sto-btn-secondary"
            style={{ color: '#818CF8' }}
          >
            БАЗА АВТОМОБІЛІВ
          </button>
          <PurchaseOrderBtn items={items} />
          <button onClick={() => setCurrentView('add')} className="sto-btn sto-btn-primary">
            ПРИЙНЯТИ ТОВАР
          </button>
        </div>
      </div>

      <InventoryStats totalValue={stats.totalValue} deficitCount={stats.deficitCount} />

      <CategoryFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        isLowStockFilter={showLowStock}
        onToggleLowStock={() => setShowLowStock(!showLowStock)}
        deficitCount={stats.deficitCount}
      />

      <InventoryToolbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <InventoryTable
        items={filteredItems}
        onUpdateStock={updateStock}
        onDelete={deleteItem}
        onEdit={(item) => setEditingItem(item)}
        onShowHistory={setHistoryItem}
        onTagClick={setSearchTerm}
      />

      {isCarManagerOpen && <CarManagerModal onClose={() => setIsCarManagerOpen(false)} />}

      {currentView === 'add' && (
        <InventoryAddScreen onBack={() => setCurrentView('list')} onSave={fetchInventory} />
      )}

      {editingItem && (
        <EditItemModal inventoryItem={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEdit} />
      )}

      {historyItem && <HistoryModal item={historyItem} onClose={() => setHistoryItem(null)} />}

      <PrintSection items={filteredItems} />
    </div>
  );
};

export default Inventory;
