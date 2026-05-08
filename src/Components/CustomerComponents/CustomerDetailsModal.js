import React, { useState } from 'react';
import { customerStyles } from './CustomerStyles';
import { CustomerCarList } from './CustomerCarList';
import { CustomerStats } from './CustomerStats';
import { CustomerActivityStatus } from './CustomerActivityStatus';
import { QuickBookingAction } from './QuickBookingAction';
import { CommunicationHistory } from './CommunicationHistory';
import { MaintenanceAlert } from './MaintenanceAlert';

export const CustomerDetailsModal = ({ 
  customer, onClose, onAddCar, onDeleteCar, onDeleteCustomer, onArchiveCustomer, onUnarchiveCustomer, onUpdateNotes 
}) => {
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [carData, setCarData] = useState({ brand: '', model: '', plate: '' });

  if (!customer) return null;

  const handleCarSubmit = (e) => {
    e.preventDefault();
    if (carData.brand && carData.model && carData.plate) {
      onAddCar(customer.id, { ...carData, vin: '—' });
      setCarData({ brand: '', model: '', plate: '' });
      setIsAddingCar(false);
    }
  };

  return (
    <div style={customerStyles.modalOverlay} onClick={onClose}>
      <div style={customerStyles.modalContent} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
          <div>
            <CustomerActivityStatus lastVisit={customer.lastVisit} />
            <h2 style={{ margin: '5px 0 0 0', color: '#F1F5F9' }}>{customer.name}</h2>
            <small style={{ color: '#94A3B8' }}>{customer.phone}</small>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {customer.isArchived ? (
                <button 
                onClick={() => onUnarchiveCustomer()} 
                style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Повернути з архіву
              </button>
            ) : (
                <button 
                onClick={() => onArchiveCustomer()} 
                style={{ background: '#F59E0B', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                В архів
              </button>
            )}
            <button 
              onClick={() => { onDeleteCustomer(customer.id); onClose(); }} 
              style={{ background: '#991b1b', color: '#FCA5A5', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Видалити
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94A3B8' }}>✕</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
          <div>
            <CustomerCarList cars={customer.cars} customerId={customer.id} onDeleteCar={onDeleteCar} />
            {!isAddingCar ? (
              <button onClick={() => setIsAddingCar(true)} style={customerStyles.addCarDashedBtn}>+ Додати автомобіль</button>
            ) : (
              <div style={customerStyles.addCarForm}>
                <input placeholder="Марка" style={customerStyles.input} value={carData.brand} onChange={e => setCarData({...carData, brand: e.target.value})} />
                <input placeholder="Модель" style={customerStyles.input} value={carData.model} onChange={e => setCarData({...carData, model: e.target.value})} />
                <input placeholder="Держ. номер" style={customerStyles.input} value={carData.plate} onChange={e => setCarData({...carData, plate: e.target.value})} />
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={handleCarSubmit} style={customerStyles.saveBtn}>Зберегти</button>
                   <button onClick={() => setIsAddingCar(false)} style={{ ...customerStyles.saveBtn, background: '#334155' }}>Скасувати</button>
                </div>
              </div>
            )}
            <CommunicationHistory />
          </div>
          <div>
            <MaintenanceAlert lastVisit={customer.lastVisit} />
            <CustomerStats customer={customer} onUpdateNotes={onUpdateNotes} />
            <QuickBookingAction customerName={customer.name} customerPhone={customer.phone} />
          </div>
        </div>
      </div>
    </div>
  );
};