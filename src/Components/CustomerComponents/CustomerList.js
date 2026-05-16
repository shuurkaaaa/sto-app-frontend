import React from 'react';
import { CustomerCard } from './CustomerCard';

export const CustomerList = ({ customers, onCustomerClick }) => (
  <div className="sto-grid-cards">
    {customers.map(customer => (
      <CustomerCard
        key={customer.id}
        customer={customer}
        onClick={onCustomerClick}
      />
    ))}
  </div>
);
