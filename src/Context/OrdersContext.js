import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useWorkers } from './WorkersContext'; 

const OrdersContext = createContext({});

// Використовуємо 127.0.0.1:5000 для стабільного з'єднання
const API_URL = 'http://localhost:5000/api/orders';

// Створюємо екземпляр axios із налаштуваннями CORS
const api = axios.create({
  withCredentials: true
});

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { fetchWorkers } = useWorkers(); 

  const fetchOrders = useCallback(async function() {
    try {
      const response = await api.get(API_URL);
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
      const response = await api.post(API_URL, orderData);
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
      const response = await api.put(`${API_URL}/${id}`, formData);
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
      // payload очікується як об'єкт { status: '...' }
      const response = await api.put(`${API_URL}/${id}/status`, payload);
      
      setOrders(function(prevOrders) {
        return prevOrders.map(function(order) {
          return order.id === id ? response.data : order;
        });
      });

      if (fetchWorkers) {
        await fetchWorkers(); 
      }
      
      return response.data;
    } catch (error) {
      console.error("Помилка оновлення статусу:", error);
    }
  };

  const deleteOrder = async function(id) {
    const confirmation = window.confirm("Ви впевнені, що хочете видалити це замовлення?");
    if (!confirmation || !id) return;

    try {
      await api.delete(`${API_URL}/${id}`);
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