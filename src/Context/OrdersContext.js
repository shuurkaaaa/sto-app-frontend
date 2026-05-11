import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWorkers } from './WorkersContext';
import { useInventoryContext } from './InventoryContext';
import { apiClient } from '../services/apiClient';

const OrdersContext = createContext({});


const API_URL = '/orders';

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { fetchWorkers } = useWorkers();
  const { fetchInventory } = useInventoryContext() || {};

  const fetchOrders = useCallback(async function() {
    try {
      const response = await apiClient.get(API_URL);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Помилка завантаження замовлень:", error);
    }
  }, []);

  const addOrder = async function(orderData) {
    try {
      const response = await apiClient.post(API_URL, orderData);
      setOrders(function(prevOrders) {
        return [response.data, ...prevOrders];
      });
      if (fetchWorkers) await fetchWorkers();
      return response.data;
    } catch (error) {
      console.error("Помилка створення замовлення:", error);
      throw error;
    }
  };

  const updateOrder = async function(id, formData) {
    if (!id) return;
    try {
      const response = await apiClient.put(`${API_URL}/${id}`, formData);
      setOrders(function(prevOrders) {
        return prevOrders.map(function(order) {
          return order.id === id ? response.data : order;
        });
      });
      if (fetchWorkers) await fetchWorkers();
      return response.data;
    } catch (error) {
      console.error("Помилка оновлення замовлення:", error);
      throw error;
    }
  };

  const updateOrderStatus = async function(id, payload) {
    if (!id) return;
    try {

      const response = await apiClient.put(`${API_URL}/${id}/status`, payload);

      setOrders(function(prevOrders) {
        return prevOrders.map(function(order) {
          return order.id === id ? response.data : order;
        });
      });

      if (fetchWorkers) {
        await fetchWorkers();
      }


      const newStatus = String(payload?.status || '').toUpperCase();
      if ((newStatus === 'COMPLETED' || newStatus === 'ВИКОНАНО') && fetchInventory) {
        await fetchInventory();
      }

      return response.data;
    } catch (error) {
      console.error("Помилка оновлення статусу:", error);
      const data = error?.response?.data;
      const userMsg = data?.message || data?.error || "Не вдалося оновити статус замовлення";
      toast.error(userMsg, { duration: 4000 });
      return null;
    }
  };

  const deleteOrder = async function(id) {
    const confirmation = window.confirm("Ви впевнені, що хочете видалити це замовлення?");
    if (!confirmation || !id) return;

    try {
      await apiClient.delete(`${API_URL}/${id}`);
      setOrders(function(prevOrders) {
        return prevOrders.filter(function(order) {
          return order.id !== id;
        });
      });
      if (fetchWorkers) await fetchWorkers();
    } catch (error) {
      console.error("Помилка видалення замовлення:", error);
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      fetchOrders,
      addOrder,
      updateOrder,
      deleteOrder,
      updateOrderStatus
    }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);