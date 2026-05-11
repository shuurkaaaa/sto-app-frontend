import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ClientsContext = createContext();

const API_BASE = 'http://localhost:5000/api/customers'; // Змінено на localhost

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token && token !== "null" && token.trim() !== "") {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);


  const fetchOptions = useCallback((method = 'GET', body = null) => {
    const options = {
      method,
      headers: getHeaders(),
      credentials: 'include'
    };
    if (body) options.body = JSON.stringify(body);
    return options;
  }, [getHeaders]);

  useEffect(() => {
    fetch(API_BASE, fetchOptions())
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching customers:", err));
  }, [fetchOptions]);

  const addCustomer = async (newData) => {
    try {
      const res = await fetch(API_BASE, fetchOptions('POST', newData));
      if (res.ok) {
        const client = await res.json();
        setClients((prev) => [...prev, client]);
      }
    } catch (err) {
      console.error("Error adding customer:", err);
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, fetchOptions('DELETE'));
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const toggleArchive = async (id, isArchived) => {
    try {
      const res = await fetch(`${API_BASE}/${id}/archive`, fetchOptions('PATCH', { isArchived }));
      if (res.ok) {
        const updated = await res.json();
        setClients((prev) => prev.map((c) => c.id === id ? updated : c));
      } else {
        console.error('Toggle archive failed:', res.status);
      }
    } catch (err) {
      console.error("Error toggling archive:", err);
    }
  };

  const updateNotes = async (id, newNotes) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, fetchOptions('PATCH', { notes: newNotes }));
      if (res.ok) {
        const updated = await res.json();
        setClients((prev) => prev.map((c) => c.id === id ? updated : c));
      }
    } catch (err) {
      console.error("Error updating notes:", err);
    }
  };

  const addCarToCustomer = async (customerId, car) => {
    try {
      const res = await fetch(`${API_BASE}/${customerId}/car`, fetchOptions('POST', car));
      if (res.status === 409) {
        alert("Авто з таким номером вже додано!");
        return;
      }
      if (res.ok) {
        const newCar = await res.json();
        setClients((prev) => prev.map((c) =>
          c.id === customerId ? { ...c, cars: [...(c.cars || []), newCar] } : c
        ));
      }
    } catch (err) {
      console.error("Error adding car:", err);
    }
  };

  const deleteCarFromCustomer = async (customerId, carId) => {
    try {
      const res = await fetch(`${API_BASE}/${customerId}/car/${carId}`, fetchOptions('DELETE'));
      if (res.ok) {
        setClients((prev) => prev.map((c) =>
          c.id === customerId ? { ...c, cars: (c.cars || []).filter((car) => car.id !== carId) } : c
        ));
      }
    } catch (err) {
      console.error("Error deleting car:", err);
    }
  };

  const addCommunicationNote = async (customerId, text) => {
    try {
      const res = await fetch(`${API_BASE}/${customerId}/note`, fetchOptions('POST', { text }));
      if (res.ok) {
        const newNote = await res.json();
        setClients((prev) => prev.map((c) =>
          c.id === customerId ? {
            ...c,
            communicationHistory: [newNote, ...(c.communicationHistory || [])]
          } : c
        ));
      }
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  const deleteCommunicationNote = async (customerId, noteId) => {
    try {
      const res = await fetch(`${API_BASE}/${customerId}/note/${noteId}`, fetchOptions('DELETE'));
      if (res.ok) {
        setClients((prev) => prev.map((c) =>
          c.id === customerId ? {
            ...c,
            communicationHistory: (c.communicationHistory || []).filter((n) => n.id !== noteId)
          } : c
        ));
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <ClientsContext.Provider value={{
      clients, addCustomer, deleteCustomer, toggleArchive, updateNotes,
      addCarToCustomer, deleteCarFromCustomer, addCommunicationNote, deleteCommunicationNote
    }}>
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