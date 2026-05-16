import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const WorkersContext = createContext({});
const API_URL = '/staff';
const CAT_API_URL = '/staff-categories';

export const WorkersProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [archivedWorkers, setArchivedWorkers] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await apiClient.get(API_URL);
      setWorkers(res.data);
    } catch (err) {
      console.error("Помилка завантаження персоналу:", err);
    }
  }, []);

  const fetchArchivedWorkers = useCallback(async () => {
    try {
      const res = await apiClient.get(`${API_URL}/archived`);
      setArchivedWorkers(res.data);
    } catch (err) {
      console.error("Помилка завантаження архіву:", err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiClient.get(CAT_API_URL);
      setCategories(res.data);
    } catch (err) {
      console.error("Помилка завантаження категорій:", err);
    }
  }, []);


  useEffect(() => {
    fetchWorkers();
    fetchCategories();
    fetchArchivedWorkers();
  }, [fetchWorkers, fetchCategories, fetchArchivedWorkers]);

  const addCategory = async (name) => {
    if (!name || name.trim() === '') return;
    try {
      const res = await apiClient.post(CAT_API_URL, { name: name.trim() });
      setCategories(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Не вдалося додати категорію:", err.response?.data || err.message);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await apiClient.delete(`${CAT_API_URL}/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));

      fetchWorkers();
    } catch (err) {
      console.error("Не вдалося видалити категорію:", err);
    }
  };

  const updateCategory = async (id, name) => {
    const trimmed = name != null ? String(name).trim() : '';
    if (!trimmed) throw new Error('EMPTY_NAME');
    try {
      const res = await apiClient.patch(`${CAT_API_URL}/${id}`, { name: trimmed });
      setCategories(prev =>
        [...prev.map(cat => (cat.id === id ? res.data : cat))].sort((a, b) =>
          a.name.localeCompare(b.name, 'uk')
        )
      );
      await fetchWorkers();
      return res.data;
    } catch (err) {
      console.error("Не вдалося оновити категорію:", err);
      throw err;
    }
  };

  const addWorker = async (workerData) => {
    try {

      const payload = {
        ...workerData,
        staffCategoryId: workerData.staffCategoryId ? Number(workerData.staffCategoryId) : null
      };
      const res = await apiClient.post(API_URL, payload);
      setWorkers(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Не вдалося додати майстра:", err);
    }
  };

  const removeWorker = async (id) => {
    try {
      await apiClient.delete(`${API_URL}/${id}`);
      const workerToArchive = workers.find(w => w.id === id);
      setWorkers(prev => prev.filter(w => w.id !== id));
      if (workerToArchive) {
        setArchivedWorkers(prev => [{ ...workerToArchive, isDeleted: true }, ...prev]);
      }
    } catch (err) {
      console.error("Помилка видалення:", err);
    }
  };

  const restoreWorker = async (id) => {
    try {
      await apiClient.put(`${API_URL}/${id}/restore`);
      const workerToRestore = archivedWorkers.find(w => w.id === id);
      setArchivedWorkers(prev => prev.filter(w => w.id !== id));
      if (workerToRestore) {
        setWorkers(prev => [ { ...workerToRestore, isDeleted: false }, ...prev]);
      }
    } catch (err) {
      console.error("Помилка відновлення:", err);
    }
  };

  const updateWorker = async (id, workerData) => {
    try {
      const payload = {
        ...workerData,
        staffCategoryId: workerData.staffCategoryId ? Number(workerData.staffCategoryId) : null
      };
      const res = await apiClient.put(`${API_URL}/${id}`, payload);
      setWorkers(prev => prev.map(w => w.id === id ? res.data : w));
    } catch (err) {
      console.error("Не вдалося оновити майстра:", err);
    }
  };

  const addWorkerEarnings = async (id, amount) => {
    try {
      const res = await apiClient.put(`${API_URL}/${id}/earnings`, { amount });
      setWorkers(prev => prev.map(w => w.id === id ? res.data : w));
    } catch (err) {
      console.error("Помилка заробітку:", err);
    }
  };

  const updateWorkerStatus = async (id, statusData) => {
    try {
      const res = await apiClient.put(`${API_URL}/${id}/status`, statusData);
      setWorkers(prev => prev.map(w => w.id === id ? res.data : w));
    } catch (err) {
      console.error("Помилка статусу:", err);
    }
  };

  return (
    <WorkersContext.Provider value={{
      workers,
      fetchWorkers,
      archivedWorkers,
      setWorkers,
      addWorker,
      removeWorker,
      restoreWorker,
      updateWorker,
      addWorkerEarnings,
      updateWorkerStatus,
      categories,
      addCategory,
      deleteCategory,
      updateCategory
    }}>
      {children}
    </WorkersContext.Provider>
  );
};

export const useWorkers = () => useContext(WorkersContext);