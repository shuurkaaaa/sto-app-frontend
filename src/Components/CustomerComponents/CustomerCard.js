import React, { useState } from 'react';
import { checkCustomerServiceReminder } from '../../utils/customerReminder';
import { VINHistoryModal } from './VINHistoryModal';
import { ServiceHistoryModal } from './ServiceHistoryModal';

export const CustomerCard = ({ customer, onClick }) => {
  const [selectedVIN, setSelectedVIN] = useState(null);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const reminderInfo = checkCustomerServiceReminder(customer);
  
  return (
    <>
      <div
        className="sto-card sto-card-clickable position-relative"
        style={reminderInfo.needsReminder ? { borderColor: '#ef4444', borderWidth: '2px' } : customer.isVip ? { borderColor: '#fbbf24' } : undefined}
        onClick={() => onClick(customer.id)}
      >
        {reminderInfo.needsReminder && (
          <div
            className="position-absolute fw-bold rounded-3 px-2 py-1 text-white"
            style={{ top: '-10px', right: '10px', background: '#ef4444', fontSize: '10px' }}
          >
            ТО ПОТРІБНЕ
          </div>
        )}
        
        {customer.isVip && !reminderInfo.needsReminder && (
          <div
            className="position-absolute fw-bold rounded-3 px-2 py-1 text-white"
            style={{ top: '-10px', right: '10px', background: '#fbbf24', fontSize: '10px' }}
          >
            VIP
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="m-0 mb-1 text-light" style={{ fontSize: '18px' }}>{customer.name}</h3>
            <div className="small" style={{ color: '#64748b' }}>{customer.phone}</div>
          </div>
          <div className="text-end">
            <div className="fw-bold" style={{ color: '#3b82f6' }}>{customer.totalSpent} грн</div>
            <small className="sto-text-muted">{customer.source}</small>
          </div>
        </div>

        <div className="mt-3 pt-2 d-flex gap-2 flex-wrap" style={{ borderTop: '1px solid var(--sto-border)' }}>
          {customer.cars && customer.cars.map((car, idx) => (
            <div key={idx} className="d-flex flex-column gap-1">
              <span
                className="text-light px-2 py-1 rounded-2 border small"
                style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)', fontSize: '12px' }}
              >
                {car.plate}
              </span>
              {car.vin && (
                <button
                  type="button"
                  className="text-light px-2 py-0 rounded-2 border small"
                  style={{
                    background: '#1e1b4b',
                    borderColor: '#4f46e5',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    border: '1px solid #4f46e5'
                  }}
                  title={`VIN: ${car.vin}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVIN(car.vin);
                  }}
                >
                  VIN: {car.vin.substring(0, 8)}...
                </button>
              )}
            </div>
          ))}
        </div>

        {reminderInfo.needsReminder && (
          <div
            className="mt-2 p-2 rounded-2 small text-white"
            style={{ background: 'rgba(239, 68, 68, 0.2)', borderLeft: '3px solid #ef4444' }}
          >
            {reminderInfo.message}
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowServiceHistory(true);
          }}
          className="sto-btn sto-btn-secondary w-100 mt-3"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          📋 Історія обслуговування
        </button>
      </div>

      <ServiceHistoryModal
        isOpen={showServiceHistory}
        onClose={() => setShowServiceHistory(false)}
        customer={customer}
      />

      <VINHistoryModal
        isOpen={!!selectedVIN}
        vin={selectedVIN}
        onClose={() => setSelectedVIN(null)}
      />
    </>
  );
};
