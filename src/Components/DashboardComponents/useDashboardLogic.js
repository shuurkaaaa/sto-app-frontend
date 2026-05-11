import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '../../Context/OrdersContext';
import { useWorkers } from '../../Context/WorkersContext';

export const useDashboardLogic = () => {
  const {
    orders,
    fetchOrders,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder
  } = useOrders();

  const { workers } = useWorkers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Всі');
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const saveOrder = async (formData) => {
    try {
      if (editingOrder?.id) {
        await updateOrder(editingOrder.id, formData);
      } else {
        await addOrder(formData);
      }
      setIsModalOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("Помилка:", error);
      alert("Не вдалося зберегти замовлення.");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (!order) return false;

      const clientName = order.customer?.name || order.client || "";
      const carInfo = order.carDetails || order.car || "";
      const plateInfo = order.plate || "";

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plateInfo.toLowerCase().includes(searchTerm.toLowerCase());

      const status = (order.status || "").toUpperCase();
      const isFinished = status === 'COMPLETED' || status === 'ВИКОНАНО';

      if (showArchive) {
        return matchesSearch && isFinished;
      } else {
        const matchesStatus = filter === 'Всі' || order.status === filter;
        return matchesSearch && matchesStatus && !isFinished;
      }
    });
  }, [orders, searchTerm, filter, showArchive]);

  return {
    orders: filteredOrders,
    allOrdersRaw: orders,
    availableMasters: workers,
    isModalOpen,
    setIsModalOpen,
    editingOrder,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    showArchive,
    toggleArchive: () => setShowArchive(!showArchive),
    openEditModal: (order) => { setEditingOrder(order); setIsModalOpen(true); },
    openCreateModal: () => { setEditingOrder(null); setIsModalOpen(true); },
    saveOrder,
    updateStatus: updateOrderStatus,
    deleteOrder
  };
};