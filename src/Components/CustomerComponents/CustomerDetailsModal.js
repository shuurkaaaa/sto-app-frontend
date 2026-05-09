import React, { useState } from 'react';
import { CustomerCarList } from './CustomerCarList';
import { CustomerStats } from './CustomerStats';
import { CustomerActivityStatus } from './CustomerActivityStatus';
import { QuickBookingAction } from './QuickBookingAction';
import { CommunicationHistory } from './CommunicationHistory';
import { MaintenanceAlert } from './MaintenanceAlert';

export const CustomerDetailsModal = ({
  customer, onClose, onAddCar, onDeleteCar, onDeleteCustomer, onArchiveCustomer, onUnarchiveCustomer, onUpdateNotes,
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
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal sto-modal-lg" onClick={e => e.stopPropagation()}>

        <div className="d-flex justify-content-between mb-4">
          <div>
            <CustomerActivityStatus lastVisit={customer.lastVisit} />
            <h2 className="m-0 text-light">{customer.name}</h2>
            <small className="sto-text-muted">{customer.phone}</small>
          </div>
          <div className="d-flex gap-2 align-items-start">
            {customer.isArchived ? (
              <button onClick={() => onUnarchiveCustomer()} className="sto-btn fw-bold text-white" style={{ background: '#10B981' }}>
                Повернути з архіву
              </button>
            ) : (
              <button onClick={() => onArchiveCustomer()} className="sto-btn fw-bold text-white" style={{ background: '#F59E0B' }}>
                В архів
              </button>
            )}
            <button
              onClick={() => { onDeleteCustomer(customer.id); onClose(); }}
              className="sto-btn fw-bold"
              style={{ background: '#991b1b', color: '#FCA5A5' }}
            >
              Видалити
            </button>
            <button onClick={onClose} className="sto-text-muted" style={{ border: 'none', background: 'none', fontSize: '24px' }}>✕</button>
          </div>
        </div>

        <div className="d-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
          <div>
            <CustomerCarList cars={customer.cars} customerId={customer.id} onDeleteCar={onDeleteCar} />
            {!isAddingCar ? (
              <button onClick={() => setIsAddingCar(true)} className="sto-btn-dashed">+ Додати автомобіль</button>
            ) : (
              <div className="sto-add-car-form">
                <input className="sto-input mb-2" placeholder="Марка" value={carData.brand} onChange={e => setCarData({ ...carData, brand: e.target.value })} />
                <input className="sto-input mb-2" placeholder="Модель" value={carData.model} onChange={e => setCarData({ ...carData, model: e.target.value })} />
                <input className="sto-input mb-2" placeholder="Держ. номер" value={carData.plate} onChange={e => setCarData({ ...carData, plate: e.target.value })} />
                <div className="d-flex gap-2">
                  <button onClick={handleCarSubmit} className="sto-btn sto-btn-primary flex-grow-1">Зберегти</button>
                  <button onClick={() => setIsAddingCar(false)} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
                </div>
              </div>
            )}
            <CommunicationHistory />
          </div>
          <div>
            <MaintenanceAlert lastVisit={customer.lastVisit} />
            <CustomerStats customer={customer} onUpdateNotes={onUpdateNotes} />
            <QuickBookingAction customer={customer} />
          </div>
        </div>
      </div>
    </div>
  );
};
