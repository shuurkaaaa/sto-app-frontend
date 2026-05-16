import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useStaffLogic } from '../Components/StaffComponents/useStaffLogic';
import { useOrders } from '../Context/OrdersContext';
import { useWorkers } from '../Context/WorkersContext';
import { StaffCard } from '../Components/StaffComponents/StaffCard';
import { StaffHeader } from '../Components/StaffComponents/StaffHeader';
import { StaffToolbar } from '../Components/StaffComponents/StaffToolbar';
import { StaffModal } from '../Components/StaffComponents/StaffModal';
import { AssignCarModal } from '../Components/StaffComponents/AssignCarModal';

const StaffPage = () => {
  const { categories, addCategory, deleteCategory, updateCategory, archivedWorkers, restoreWorker } = useWorkers();
  const { orders, updateOrderStatus } = useOrders();

  const [viewMode, setViewMode] = useState('active');

  const {
    processedWorkers, toggleStatus, confirmAssignCar, assigningWorkerId, setAssigningWorkerId,
    deleteWorker, setCurrentFilter, currentFilter, setSortBy, sortBy,
    isModalOpen, openModal, closeModal, saveWorker, editingWorker,
  } = useStaffLogic();

  const handleDeleteCategory = useCallback(async (id) => {
    const categoryToDelete = categories.find(c => c.id === id);
    await deleteCategory(id);
    if (currentFilter === categoryToDelete?.name) setCurrentFilter('Всі');
  }, [categories, currentFilter, deleteCategory, setCurrentFilter]);

  const handleRenameCategory = useCallback(async (id, previousName, newName) => {
    try {
      const updated = await updateCategory(id, newName);
      toast.success('Спеціалізацію оновлено', { duration: 2000 });
      if (currentFilter === previousName) setCurrentFilter(updated.name);
    } catch (err) {
      if (err?.message === 'EMPTY_NAME') return;
      throw err;
    }
  }, [updateCategory, currentFilter, setCurrentFilter]);

  const displayList = viewMode === 'active' ? processedWorkers : archivedWorkers;

  return (
    <div className="sto-page">
      <div className="w-100">
        <div className="d-flex justify-content-end align-items-center mb-4">
          <button
            onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')}
            className="sto-btn sto-btn-ghost"
            style={{ padding: '8px 16px', fontWeight: 500 }}
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
              onAddCategory={addCategory}
              onDeleteCategory={handleDeleteCategory}
              onRenameCategory={handleRenameCategory}
            />
            <StaffToolbar
              onAdd={openModal}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </>
        )}

        <div className="sto-grid-staff mt-3">
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
            <p className="sto-text-muted">Співробітників не знайдено</p>
          )}
        </div>
      </div>

      <StaffModal isOpen={isModalOpen} onClose={closeModal} onSave={saveWorker} worker={editingWorker} />
      <AssignCarModal
        isOpen={!!assigningWorkerId}
        onClose={() => setAssigningWorkerId(null)}
        pendingOrders={(orders || []).filter(o => o.status === 'PENDING' && !o.masterId)}
        onConfirm={async (carInfo, orderId) => {
          if (updateOrderStatus && assigningWorkerId) {
            await updateOrderStatus(orderId, { status: 'IN_WORK', masterId: assigningWorkerId });
          }
          await confirmAssignCar();
        }}
      />
    </div>
  );
};

export default StaffPage;
