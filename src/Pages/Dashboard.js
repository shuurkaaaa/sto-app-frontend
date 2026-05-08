import React, { useState } from 'react';
import { useDashboardLogic } from '../Components/DashboardComponents/useDashboardLogic';
import { DashboardToolbar } from '../Components/DashboardComponents/DashboardToolbar';
import { DashboardTable } from '../Components/DashboardComponents/DashboardTable';
import { OrderModal } from '../Components/DashboardComponents/OrderModal';
import { OrderSearch } from '../Components/DashboardComponents/OrderSearch';
import { MasterWorkload } from '../Components/DashboardComponents/MasterWorkload';
import { PartsUsageModal } from '../Components/DashboardComponents/PartsUsageModal';

import { dashboardStyles } from '../Components/DashboardComponents/DashboardStyles';

const Dashboard = () => {
  const logic = useDashboardLogic();
  const [partsOrder, setPartsOrder] = useState(null);

  return (
    <div style={dashboardStyles.container}>
      {/* Верхня панель з фільтрами та кнопкою "Новий заїзд" */}
      <DashboardToolbar 
        filter={logic.filter} 
        onFilterChange={logic.setFilter} 
        onAdd={logic.openCreateModal} 
        showArchive={logic.showArchive}
        onToggleArchive={logic.toggleArchive}
      />
      
      {/* Секція завантаженості майстрів на поточний момент */}
      <MasterWorkload 
        allOrders={logic.allOrdersRaw} 
        workers={logic.availableMasters} 
      />
      
      {/* Розділювач */}
      <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '20px 0' }} />
      
      {/* Заголовок журналу */}
      <h2 style={dashboardStyles.title}>
        {logic.showArchive ? "Архів виконаних замовлень" : "Поточні замовлення в роботі"}
      </h2>
      
      {/* Поле пошуку за клієнтом або автомобілем */}
      <OrderSearch 
        searchTerm={logic.searchTerm} 
        onSearchChange={logic.setSearchTerm} 
      />
      
      {/* Таблиця з даними замовлень */}
      <DashboardTable 
        orders={logic.orders} 
        onStatusChange={logic.updateStatus} 
        onDelete={logic.deleteOrder}
        onEdit={logic.openEditModal}
        onOpenParts={function(order) {
          setPartsOrder(order);
        }}
      />
      
      {/* Модальне вікно створення/редагування (Додано styles={dashboardStyles}) */}
      <OrderModal 
        isOpen={logic.isModalOpen} 
        onClose={function() {
          logic.setIsModalOpen(false);
        }} 
        onSave={logic.saveOrder} 
        masters={logic.availableMasters} 
        initialData={logic.editingOrder}
        styles={dashboardStyles} 
      />
      
      {/* Модальне вікно для перегляду списку використаних запчастин */}
      <PartsUsageModal 
        isOpen={Boolean(partsOrder)} 
        onClose={function() {
          setPartsOrder(null);
        }} 
        order={partsOrder} 
      />
    </div>
  );
};

export default Dashboard;