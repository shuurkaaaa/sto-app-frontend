import React, { useState } from 'react';
import { QuickBookingModal } from './QuickBookingModal';

export const QuickBookingAction = ({ customer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="sto-btn sto-btn-primary w-100 mt-3" onClick={() => setIsOpen(true)}>
        Записати на сервіс
      </button>

      <QuickBookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customer={customer}
      />
    </>
  );
};
