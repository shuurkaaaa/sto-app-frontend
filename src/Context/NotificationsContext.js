import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const NotificationsContext = createContext(null);
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const typeConfig = {
  manual: { label: 'ЗАМІТКА', color: '#10B981' },
  inventory: { label: 'СКЛАД', color: '#EF4444' },
  service: { label: 'СЕРВІС', color: '#3B82F6' },
  delay: { label: 'ЗАТРИМКА', color: '#F59E0B' }
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const shownToastIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  // Функція для низького залишку (викликається локально з компонентів)
  const notifyLowStock = useCallback((itemName, current, minimum) => {
    const safeId = `stock-alert-${itemName.replace(/\s+/g, '-').toLowerCase()}`;

    if (current > minimum) {
      toast.dismiss(safeId);
      shownToastIds.current.delete(safeId);
      return;
    }

    if (!shownToastIds.current.has(safeId)) {
      toast.custom((t) => (
        <div style={{
          background: '#1E293B',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          borderLeft: '6px solid #EF4444',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '320px',
          pointerEvents: 'auto'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }}>КРИТИЧНИЙ ЗАЛИШОК</div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{itemName} закінчується!</div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>
            Залишилось: <span style={{ color: '#fff', fontWeight: 'bold' }}>{current} шт.</span>
          </div>
        </div>
      ), { 
        id: safeId, 
        duration: 2000, 
        position: 'top-right' 
      });
      shownToastIds.current.add(safeId);
    }
  }, []);

  // Основна функція отримання сповіщень
  const fetchNotifications = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    
    try {
      const response = await api.get('/notifications');
      const freshData = Array.isArray(response.data) ? response.data : [];

      // 1. Прибираємо тости, яких більше немає в списку бекенду
      const freshIds = new Set(freshData.map(n => n.id));
      shownToastIds.current.forEach(id => {
        if (!freshIds.has(id)) {
          toast.dismiss(id);
          shownToastIds.current.delete(id);
        }
      });

      // 2. Показуємо нові тости
      if (!isFirstLoad.current) {
        freshData.forEach(item => {
          if (!shownToastIds.current.has(item.id)) {
            const config = typeConfig[item.type] || { label: 'СИСТЕМА', color: '#64748B' };
            const isCritical = item.priority === 'high' || item.type === 'inventory';

            toast.custom((t) => (
              <div style={{
                background: '#1E293B',
                color: '#fff',
                padding: '16px',
                borderRadius: '12px',
                borderLeft: `6px solid ${isCritical ? '#EF4444' : config.color}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '300px',
                pointerEvents: 'auto'
              }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: isCritical ? '#EF4444' : '#64748B', textTransform: 'uppercase' }}>
                  {config.label}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.title}</div>
                <div style={{ fontSize: '13px', color: '#94A3B8' }}>{item.message}</div>
              </div>
            ), { 
              id: item.id, 
              duration: 2000, 
              position: 'top-right' 
            });

            shownToastIds.current.add(item.id);
          }
        });
      } else {
        // При першому завантаженні просто наповнюємо список без сповіщень
        freshData.forEach(item => shownToastIds.current.add(item.id));
        isFirstLoad.current = false;
      }

      setNotifications(freshData);
    } catch (error) {
      console.error("Помилка завантаження сповіщень:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (noteData) => {
    try {
      await api.post('/notifications', noteData);
      toast.success("Замітку додано", { duration: 2000 });
      fetchNotifications();
    } catch (error) {
      toast.error("Помилка збереження", { duration: 2000 });
    }
  };

  const removeNote = async (id) => {
    // 1. Відразу видаляємо з локального стейту та реєстру тостів
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.dismiss(id);
    shownToastIds.current.delete(id);

    try {
      // 2. Відправляємо запит на бекенд (upsert для системних або delete для ручних)
      await api.delete(`/notifications/${id}`);
      toast.success("Видалено", { duration: 2000 });
    } catch (error) {
      console.error("Помилка видалення:", error);
      toast.error("Помилка при видаленні", { duration: 2000 });
      // У разі помилки повертаємо список (refresh)
      fetchNotifications();
    }
  };

  const clearAllManual = async () => {
    try {
      await api.delete('/notifications/clear-all');
      toast.success("Архів очищено", { duration: 2000 });
      shownToastIds.current.clear();
      setNotifications([]);
      fetchNotifications();
    } catch (error) {
      toast.error("Помилка очищення", { duration: 2000 });
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); 
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    count: notifications.length,
    loading,
    refresh: fetchNotifications,
    addNote,
    removeNote,
    clearAllManual,
    notifyLowStock
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    return { 
      notifications: [], 
      count: 0, 
      loading: false, 
      refresh: () => {}, 
      addNote: () => {}, 
      removeNote: () => {}, 
      clearAllManual: () => {},
      notifyLowStock: () => {}
    };
  }
  return context;
};