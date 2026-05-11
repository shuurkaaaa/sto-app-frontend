import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications } from './NotificationsContext';
import { apiClient } from '../services/apiClient';


const InventoryContext = createContext({});


export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Всі' }]);
  const [staffCategories, setStaffCategories] = useState([]);



  const { notifyLowStock, refresh: refreshNotifications } = useNotifications();



  const fetchInventory = useCallback(async () => {
    try {
      const response = await apiClient.get('/inventory-actions');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Помилка завантаження складу:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories([{ id: 'all', name: 'Всі' }, ...(Array.isArray(response.data) ? response.data : [])]);
    } catch (error) {
      console.error("Помилка завантаження категорій:", error);
    }
  }, []);

  const fetchStaffCategories = useCallback(async () => {
    try {
      const response = await apiClient.get('/staff-categories');
      setStaffCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Помилка завантаження категорій персоналу:", error);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchStaffCategories();
  }, [fetchInventory, fetchCategories, fetchStaffCategories]);



  /**
   * Оновлення залишків (Прихід/Списання) з миттєвою синхронізацією сповіщень
   */
  const updateStock = async (id, newQuantity) => {
    try {
      const response = await apiClient.put(`/inventory-actions/${id}`, {
        current: newQuantity
      });

      const updatedItem = response.data;

      if (updatedItem) {

        notifyLowStock(updatedItem.name, updatedItem.current, updatedItem.minimum);


        refreshNotifications();


        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, ...updatedItem } : item
        ));
      }

      return updatedItem;
    } catch (error) {
      console.error("Помилка при оновленні залишків:", error);
    }
  };

  /**
   * Додавання нового товару
   */
  const addNewItems = async (formData) => {
    try {
      const response = await apiClient.post('/inventory-actions/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newItem = response.data;


      notifyLowStock(newItem.name, newItem.current, newItem.minimum);

      await fetchInventory();
      await fetchCategories();
      refreshNotifications();

      return newItem;
    } catch (error) {
      console.error("Помилка збереження товару:", error);
      throw error;
    }
  };

  /**
   * Редагування характеристик товару
   */
  const updateItem = async (id, data) => {
    if (!id) {
      console.error("Помилка: ID товару не визначено!");
      return;
    }
    try {
      const isFormData = data instanceof FormData;
      const response = await apiClient.put(`/inventory-actions/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });

      const updatedItem = response.data;


      notifyLowStock(updatedItem.name, updatedItem.current, updatedItem.minimum);

      await fetchInventory();
      refreshNotifications();

      return updatedItem;
    } catch (error) {
      console.error("Детальна помилка оновлення:", error.response?.data || error.message);
      throw error;
    }
  };

  /**
   * Видалення товару
   */
  const removeItem = async (id) => {
    try {
      const stringId = String(id);
      await apiClient.delete(`/inventory-actions/${id}`);

      setItems((prev) => prev.filter(item => String(item.id) !== stringId));


      refreshNotifications();
    } catch (error) {
      console.error("Помилка видалення товару:", error);
      throw error;
    }
  };



  const getItemLogs = async (id) => {
    try {
      const response = await apiClient.get(`/inventory-actions/${id}/logs`);
      return response.data;
    } catch (error) {
      console.error("Помилка завантаження історії товару:", error);
      return [];
    }
  };

  const getPurchaseHistory = async () => {
    try {
      const response = await apiClient.get('/purchase/history');
      return response.data;
    } catch (error) {
      console.error("Помилка отримання історії закупівель:", error);
      return [];
    }
  };



  const addCategory = async (name) => {
    try {
      const response = await apiClient.post('/categories', { name });
      setCategories((prev) => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error("Помилка створення категорії:", error);
    }
  };

  const editCategory = async (id, newName) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, { name: newName });
      setCategories((prev) => prev.map(cat => String(cat.id) === String(id) ? response.data : cat));
      await fetchInventory();
    } catch (error) {
      console.error("Помилка редагування категорії:", error);
    }
  };

  const deleteCategory = async (id) => {
    if (id === 'all') return;
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter(cat => String(cat.id) !== String(id)));
      await fetchInventory();
    } catch (error) {
      console.error("Помилка видалення категорії:", error);
    }
  };

  return (
    <InventoryContext.Provider value={{
      items,
      fetchInventory,
      updateStock,
      removeItem,
      addNewItems,
      updateItem,
      getItemLogs,
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      staffCategories,
      fetchStaffCategories,
      getPurchaseHistory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventoryContext повинен використовуватись всередині InventoryProvider');
  return context;
};