import React, { useState, useMemo } from 'react';
import { useClients } from '../Context/ClientsContext';
import { customerStyles } from '../Components/CustomerComponents/CustomerStyles'; 

import { CustomerHeader } from '../Components/CustomerComponents/CustomerHeader';
import { CustomerToolbar } from '../Components/CustomerComponents/CustomerToolbar';
import { CustomerList } from '../Components/CustomerComponents/CustomerList';
import { CustomerDetailsModal } from '../Components/CustomerComponents/CustomerDetailsModal';
import { AddCustomerModal } from '../Components/CustomerComponents/AddCustomerModal';

const Customers = () => {
  const { 
    clients, 
    addCustomer, 
    deleteCustomer, 
    toggleArchive, 
    updateNotes,
    addCommunicationNote, 
    deleteCommunicationNote,
    addCarToCustomer,
    deleteCarFromCustomer
  } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(clients)) {
      return [];
    }

    return clients.filter((customer) => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.phone.includes(searchTerm) ||
                            (customer.cars && customer.cars.some((car) => car.plate.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesArchive = (customer.isArchived === true) === showArchive;
      return matchesSearch && matchesArchive;
    });
  }, [clients, searchTerm, showArchive]);

  const selectedCustomer = useMemo(() => {
    if (!Array.isArray(clients)) return null;
    return clients.find((customer) => customer.id === selectedCustomerId);
  }, [clients, selectedCustomerId]);

  return (
    <div style={customerStyles.wrapper}>
      <div style={customerStyles.content}>
        
        <CustomerHeader onAddClick={() => setIsAddModalOpen(true)} />

        <CustomerToolbar 
          value={searchTerm} 
          onChange={setSearchTerm}
          showArchive={showArchive}
          onToggleArchive={() => setShowArchive(!showArchive)}
        />

        <CustomerList 
          customers={filteredCustomers} 
          onCustomerClick={setSelectedCustomerId} 
        />

        {selectedCustomer && (
          <CustomerDetailsModal 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomerId(null)} 
            onAddCar={(id, car) => addCarToCustomer(id, car)}
            onDeleteCar={(id, carId) => deleteCarFromCustomer(id, carId)}
            onDeleteCustomer={() => { 
              deleteCustomer(selectedCustomer.id); 
              setSelectedCustomerId(null); 
            }}
            onArchiveCustomer={() => { 
              toggleArchive(selectedCustomer.id, true); 
              setSelectedCustomerId(null); 
            }}
            onUnarchiveCustomer={() => { 
              toggleArchive(selectedCustomer.id, false); 
              setSelectedCustomerId(null); 
            }}
            onUpdateNotes={(newNotes) => updateNotes(selectedCustomer.id, newNotes)}
            onAddNote={(text) => addCommunicationNote(selectedCustomer.id, text)}
            onDeleteNote={(noteId) => deleteCommunicationNote(selectedCustomer.id, noteId)}
          />
        )}

        <AddCustomerModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={addCustomer} 
        />

      </div>
    </div>
  );
};

export default Customers;