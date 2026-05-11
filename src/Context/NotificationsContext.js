import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiClient } from '../services/apiClient';

const NotificationsContext = createContext(null);

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


  const fetchNotifications = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);

    try {
      const response = await apiClient.get('/notifications');
      const freshData = Array.isArray(response.data) ? response.data : [];


      const freshIds = new Set(freshData.map(n => n.id));
      shownToastIds.current.forEach(id => {
        if (!freshIds.has(id)) {
          toast.dismiss(id);
          shownToastIds.current.delete(id);
        }
      });


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
      await apiClient.post('/notifications', noteData);
      toast.success("Замітку додано", { duration: 2000 });
      fetchNotifications();
    } catch (error) {
      toast.error("Помилка збереження", { duration: 2000 });
    }
  };

  const removeNote = async (id) => {

    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.dismiss(id);
    shownToastIds.current.delete(id);

    try {

      await apiClient.delete(`/notifications/${id}`);
      toast.success("Видалено", { duration: 2000 });
    } catch (error) {
      console.error("Помилка видалення:", error);
      toast.error("Помилка при видаленні", { duration: 2000 });

      fetchNotifications();
    }
  };

  const clearAllManual = async () => {
    try {
      await apiClient.delete('/notifications/clear-all');
      toast.success("Архів очищено", { duration: 2000 });
      shownToastIds.current.clear();
      setNotifications([]);
      fetchNotifications();
    } catch (error) {
      toast.error("Помилка очищення", { duration: 2000 });
    }
  };

  const notifyMaintenanceNeeded = useCallback((customer) => {
    if (!customer || !customer.name) return;

    const safeId = `maintenance-alert-${customer.id}`;

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
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#EF4444', textTransform: 'uppercase' }}>
            ⚡ ОБСЛУГОВУВАННЯ ПОТРІБНЕ
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{customer.name}</div>
          <div style={{ fontSize: '13px', color: '#94A3B8' }}>
            Час запропонувати клієнту техническое обслуживание
          </div>
        </div>
      ), {
        id: safeId,
        duration: 3000,
        position: 'top-right'
      });
      shownToastIds.current.add(safeId);
    }

    // Додаємо в список сповіщень
    const newNotification = {
      id: safeId,
      type: 'maintenance',
      priority: 'high',
      title: `ТО потрібне: ${customer.name}`,
      message: 'Останній візит був більше 6 місяців тому. Запропонуйте клієнту обслуговування.',
      isRead: false,
      isDismissed: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => {
      const exists = prev.some(n => n.id === safeId);
      if (exists) return prev;
      return [newNotification, ...prev];
    });
  }, []);

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
    notifyLowStock,
    notifyMaintenanceNeeded
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
      notifyLowStock: () => {},
      notifyMaintenanceNeeded: () => {}
    };
  }
  return context;
};