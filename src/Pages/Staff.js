import React, { useState, useCallback } from 'react';
import { useStaffLogic } from '../Components/StaffComponents/useStaffLogic';
import { useOrders } from '../Context/OrdersContext';
import { useWorkers } from '../Context/WorkersContext'; 
import { StaffCard } from '../Components/StaffComponents/StaffCard';
import { StaffHeader } from '../Components/StaffComponents/StaffHeader';
import { StaffToolbar } from '../Components/StaffComponents/StaffToolbar';
import { StaffModal } from '../Components/StaffComponents/StaffModal';
import { AddCategoryModal } from '../Components/StaffComponents/AddCategoryModal';
import { AssignCarModal } from '../Components/StaffComponents/AssignCarModal';
import staffStyles from '../Components/StaffComponents/StaffStyles';

const StaffPage = () => {
  const { categories, addCategory, deleteCategory, archivedWorkers, restoreWorker } = useWorkers();
  const { orders, updateOrderStatus } = useOrders();
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('active');

  const { 
    processedWorkers, toggleStatus, confirmAssignCar, assigningWorkerId, setAssigningWorkerId,
    deleteWorker, setCurrentFilter, currentFilter, setSortBy, sortBy,
    isModalOpen, openModal, closeModal, saveWorker, editingWorker 
  } = useStaffLogic();

  const handleDeleteCategory = useCallback(async (id) => {
    const categoryToDelete = categories.find(c => c.id === id);
    await deleteCategory(id);
    if (currentFilter === categoryToDelete?.name) setCurrentFilter('Всі');
  }, [categories, currentFilter, deleteCategory, setCurrentFilter]);

  const displayList = viewMode === 'active' ? processedWorkers : archivedWorkers;

  return (
    <div style={staffStyles.container}>
      <div style={{ width: '100%' }}> 
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')} 
            style={{ 
              padding: '8px 16px', borderRadius: '10px', border: '1px solid #334155', 
              cursor: 'pointer', background: '#1E293B', color: '#94A3B8', fontSize: '13px',
              fontWeight: '500'
            }}
          >
            {viewMode === 'active' ? 'Переглянути архів' : 'Повернутися до команди'}
          </button>
        </div>

        {viewMode === 'active' && (
          <>
            <StaffHeader 
              categories={categories} 
              currentFilter={currentFilter} 
              onFilterChange={setCurrentFilter} 
              onAddCategory={() => setIsCatModalOpen(true)} 
              onDeleteCategory={handleDeleteCategory}
            />
            <StaffToolbar 
              onAdd={openModal} 
              sortBy={sortBy} 
              onSortChange={setSortBy} 
            />
          </>
        )}
        
        <div style={staffStyles.grid}>
          {displayList && displayList.length > 0 ? (
            displayList.map(worker => (
              <StaffCard 
                key={worker.id} 
                worker={worker} 
                isArchived={viewMode === 'archived'}
                onToggleStatus={toggleStatus} 
                onEdit={openModal} 
                onDelete={deleteWorker} 
                onRestore={restoreWorker}
              />
            ))
          ) : (
            <p style={{ color: '#94A3B8' }}>Співробітників не знайдено</p>
          )}
        </div>
      </div>

      <StaffModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={saveWorker} 
        worker={editingWorker} 
      />
      
      <AddCategoryModal 
        isOpen={isCatModalOpen} 
        onClose={() => setIsCatModalOpen(false)} 
        onAdd={addCategory} 
      />
      
      <AssignCarModal 
        isOpen={!!assigningWorkerId} 
        onClose={() => setAssigningWorkerId(null)} 
        pendingOrders={orders?.filter(o => o.status === 'Очікує') || []} 
        onConfirm={(carInfo, orderId) => {
          confirmAssignCar(carInfo); 
          if (updateOrderStatus) updateOrderStatus(orderId, 'В роботі');
        }} 
      />
    </div>
  );
};

export default StaffPage;