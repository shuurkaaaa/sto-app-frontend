import { useState, useMemo } from 'react';
import { useWorkers } from '../../Context/WorkersContext';
import { useOrders } from '../../Context/OrdersContext';

export const useStaffLogic = () => {
  const { 
    workers, fetchWorkers, addWorker, removeWorker, updateWorker, 
    updateWorkerStatus, addCategory, deleteCategory 
  } = useWorkers();
  const { orders, fetchOrders, updateOrderStatus } = useOrders();

  const [currentFilter, setCurrentFilter] = useState('Всі');
  const [sortBy, setSortBy] = useState('id');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [assigningWorkerId, setAssigningWorkerId] = useState(null);

  const processedWorkers = useMemo(() => {
    let list = [...(workers || [])];

    if (currentFilter !== 'Всі') {
      list = list.filter(w => {
        // Тепер беремо назву категорії з об'єкта staffCategory
        const workerCategoryName = w.staffCategory?.name || "";
        return String(workerCategoryName).trim() === String(currentFilter).trim();
      });
    }

    // Збагачуємо кожного майстра інформацією про активні замовлення
    const ACTIVE_STATUSES = ['IN_WORK', 'PENDING', 'READY'];
    list = list.map(w => {
      const activeOrders = (orders || []).filter(
        o => o.masterId === w.id && ACTIVE_STATUSES.includes(o.status)
      );
      const carFromOrder = activeOrders[0]?.carDetails || activeOrders[0]?.carInfo || '';
      return {
        ...w,
        hasActiveOrder: activeOrders.length > 0,
        activeOrdersCount: activeOrders.length,
        currentCar: w.currentCar || carFromOrder,
      };
    });

    if (sortBy === 'name') {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === 'exp') {
      list.sort((a, b) => (Number(b.exp) || 0) - (Number(a.exp) || 0));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    
    return list;
  }, [workers, orders, currentFilter, sortBy]);

  const toggleStatus = async (id) => {
    const worker = workers.find(w => w.id === id);
    if (!worker) return;
    
    if (worker.status === 'Вільний') {
      setAssigningWorkerId(id);
    } else {
      const currentOrder = orders?.find(o => o.masterId === id && (o.status === 'IN_WORK' || o.status === 'PENDING'));
      
      if (currentOrder) {
        await updateOrderStatus(currentOrder.id, { status: 'READY' });
      } else {
        await updateWorkerStatus(id, { status: 'Вільний', currentCar: "" });
      }
      
      setTimeout(async () => {
        await fetchWorkers();
        if (fetchOrders) await fetchOrders();
      }, 300);
    }
  };

  const confirmAssignCar = async (carInfo) => {
    if (!assigningWorkerId) return;
    await updateWorkerStatus(assigningWorkerId, { status: 'Зайнятий', currentCar: carInfo });
    setAssigningWorkerId(null);
    await fetchWorkers();
  };

  const saveWorker = async (workerData) => {
    try {
      if (workerData.id) {
        await updateWorker(workerData.id, workerData);
      } else {
        await addWorker(workerData);
      }
      closeModal();
    } catch (err) {
      console.error("Помилка при збереженні:", err);
    }
  };

  const deleteWorker = async (id) => {
    if(window.confirm("Видалити майстра в архів?")) {
      await removeWorker(id);
    }
  };

  const openModal = (worker = null) => {
    setEditingWorker(worker);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorker(null);
  };

  return { 
    processedWorkers, toggleStatus, confirmAssignCar, assigningWorkerId, setAssigningWorkerId, 
    setCurrentFilter, currentFilter, setSortBy, sortBy, deleteWorker,
    isModalOpen, openModal, closeModal, saveWorker, editingWorker,
    addCategory, deleteCategory 
  };
};