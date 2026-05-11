import React from 'react';
import { checkCustomerServiceReminder } from '../../utils/customerReminder';

export const MaintenanceAlert = ({ customer }) => {
  if (!customer) return null;
  
  const reminderInfo = checkCustomerServiceReminder(customer);
  
  if (!reminderInfo.needsReminder) return null;

  return (
    <div 
      className="rounded-3 p-3 mb-3"
      style={{
        background: 'rgba(239, 68, 68, 0.1)',
        borderLeft: '4px solid #ef4444',
        borderRadius: '8px'
      }}
    >
      <div>
        <h4 className="m-0 fw-bold" style={{ color: '#fca5a5', fontSize: '14px' }}>
          Час на планове обслуговування!
        </h4>
        <p className="m-0 small mt-2" style={{ color: '#f87171' }}>
          {reminderInfo.message}
        </p>
        {reminderInfo.lastServiceDate && (
          <p className="m-0 small mt-1" style={{ color: '#dc2626' }}>
            Останнє ТО: {reminderInfo.lastServiceDate}
          </p>
        )}
      </div>
    </div>
  );
};
