import React, { useState } from 'react';
import { useDashboardLogic } from '../Components/DashboardComponents/useDashboardLogic';
import { DashboardToolbar } from '../Components/DashboardComponents/DashboardToolbar';
import { DashboardTable } from '../Components/DashboardComponents/DashboardTable';
import { OrderModal } from '../Components/DashboardComponents/OrderModal';
import { OrderSearch } from '../Components/DashboardComponents/OrderSearch';
import { MasterWorkload } from '../Components/DashboardComponents/MasterWorkload';
import { PartsUsageModal } from '../Components/DashboardComponents/PartsUsageModal';

const Dashboard = () => {
  const logic = useDashboardLogic();
  const [partsOrder, setPartsOrder] = useState(null);

  return (
    <div className="sto-page">
      <DashboardToolbar
        filter={logic.filter}
        onFilterChange={logic.setFilter}
        onAdd={logic.openCreateModal}
        showArchive={logic.showArchive}
        onToggleArchive={logic.toggleArchive}
      />

      <MasterWorkload allOrders={logic.allOrdersRaw} workers={logic.availableMasters} />

      <hr className="sto-divider" />

      <h2 className="sto-section-title">
        {logic.showArchive ? 'Архів виконаних замовлень' : 'Поточні замовлення в роботі'}
      </h2>

      <OrderSearch searchTerm={logic.searchTerm} onSearchChange={logic.setSearchTerm} />

      <DashboardTable
        orders={logic.orders}
        onStatusChange={logic.updateStatus}
        onDelete={logic.deleteOrder}
        onEdit={logic.openEditModal}
        onOpenParts={(order) => setPartsOrder(order)}
      />

      <OrderModal
        isOpen={logic.isModalOpen}
        onClose={() => logic.setIsModalOpen(false)}
        onSave={logic.saveOrder}
        masters={logic.availableMasters}
        initialData={logic.editingOrder}
      />

      <PartsUsageModal
        isOpen={Boolean(partsOrder)}
        onClose={() => setPartsOrder(null)}
        order={partsOrder}
      />
    </div>
  );
};

export default Dashboard;
