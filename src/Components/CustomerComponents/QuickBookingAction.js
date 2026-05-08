import React, { useState } from 'react';
import { customerStyles } from './CustomerStyles';
import { QuickBookingModal } from './QuickBookingModal';

export const QuickBookingAction = ({ customerName, customerPhone }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button style={customerStyles.bookingBtn} onClick={() => setIsOpen(true)}>
        Записати на сервіс
      </button>

      <QuickBookingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        customerName={customerName} 
        customerPhone={customerPhone}
      />
    </>
  );
};