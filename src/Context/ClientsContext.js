import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const ClientsContext = createContext();

const API_BASE = '/customers';

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await apiClient.get(API_BASE);
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addCustomer = async (newData) => {
    try {
      const res = await apiClient.post(API_BASE, newData);
      setClients((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await apiClient.delete(`${API_BASE}/${id}`);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const toggleArchive = async (id, isArchived) => {
    try {
      const res = await apiClient.patch(`${API_BASE}/${id}/archive`, { isArchived });
      setClients((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      console.error('Error toggling archive:', err);
    }
  };

  const updateNotes = async (id, newNotes) => {
    try {
      const res = await apiClient.patch(`${API_BASE}/${id}`, { notes: newNotes });
      setClients((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      console.error('Error updating notes:', err);
    }
  };

  const addCarToCustomer = async (customerId, car) => {
    try {
      const res = await apiClient.post(`${API_BASE}/${customerId}/car`, car);
      const newCar = res.data;
      setClients((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, cars: [...(c.cars || []), newCar] } : c))
      );
    } catch (err) {
      if (err?.response?.status === 409) {
        alert('Авто з таким номером вже додано!');
        return;
      }
      console.error('Error adding car:', err);
    }
  };

  const deleteCarFromCustomer = async (customerId, carId) => {
    try {
      await apiClient.delete(`${API_BASE}/${customerId}/car/${carId}`);
      setClients((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, cars: (c.cars || []).filter((car) => car.id !== carId) } : c
        )
      );
    } catch (err) {
      console.error('Error deleting car:', err);
    }
  };

  const addCommunicationNote = async (customerId, text) => {
    try {
      const res = await apiClient.post(`${API_BASE}/${customerId}/note`, { text });
      const newNote = res.data;
      setClients((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, communicationHistory: [newNote, ...(c.communicationHistory || [])] }
            : c
        )
      );
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const deleteCommunicationNote = async (customerId, noteId) => {
    try {
      await apiClient.delete(`${API_BASE}/${customerId}/note/${noteId}`);
      setClients((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                communicationHistory: (c.communicationHistory || []).filter((n) => n.id !== noteId),
              }
            : c
        )
      );
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  return (
    <ClientsContext.Provider
      value={{
        clients,
        fetchClients,
        refreshClients: fetchClients,
        addCustomer,
        deleteCustomer,
        toggleArchive,
        updateNotes,
        addCarToCustomer,
        deleteCarFromCustomer,
        addCommunicationNote,
        deleteCommunicationNote,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients має використовуватися всередині ClientsProvider');
  }
  return context;
};
