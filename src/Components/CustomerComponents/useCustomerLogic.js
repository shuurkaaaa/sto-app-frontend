import { useState, useMemo } from 'react';

export const useCustomerLogic = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Олександр Іванов",
      phone: "+380 67 111 22 33",
      source: "Instagram",
      notes: "Надає перевагу оригінальним запчастинам.",
      cars: [{ brand: "Skoda Octavia", plate: "AA 1122 BB", vin: "XW8ZZZ123" }],
      communicationHistory: [
        { id: 101, date: "02.03.2026", text: "Реєстрація клієнта в базі" }
      ],
      totalSpent: 15400,
      lastVisit: "2025-08-15"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');


  const addCustomer = (newData) => {
    setCustomers(prev => [...prev, {
      ...newData,
      id: Date.now(),
      cars: newData.cars || [],
      communicationHistory: [{ id: Date.now() + 1, date: new Date().toLocaleDateString('uk-UA'), text: "Створено картку клієнта" }],
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0]
    }]);
  };

  const deleteCustomer = (id) => {
    if (window.confirm("Видалити цього клієнта з бази?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };


  const addCarToCustomer = (customerId, car) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, cars: [...c.cars, car] } : c
    ));
  };

  const deleteCarFromCustomer = (customerId, plate) => {
    if (window.confirm("Видалити це авто?")) {
      setCustomers(prev => prev.map(c =>
        c.id === customerId ? { ...c, cars: c.cars.filter(car => car.plate !== plate) } : c
      ));
    }
  };


  const updateNotes = (customerId, newNotes) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, notes: newNotes } : c
    ));
  };


  const addCommunicationNote = (customerId, text) => {
    const newNote = {
      id: Date.now(),
      date: new Date().toLocaleDateString('uk-UA'),
      text: text
    };
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? { ...c, communicationHistory: [newNote, ...c.communicationHistory] }
        : c
    ));
  };


  const deleteCommunicationNote = (customerId, noteId) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId
        ? { ...c, communicationHistory: c.communicationHistory.filter(n => n.id !== noteId) }
        : c
    ));
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.cars.some(car => car.plate.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  return {
    customers: filteredCustomers,
    searchTerm,
    setSearchTerm,
    addCustomer,
    deleteCustomer,
    addCarToCustomer,
    deleteCarFromCustomer,
    updateNotes,
    addCommunicationNote,
    deleteCommunicationNote
  };
};