import React from 'react';
import { CustomerCard } from './CustomerCard';

export const CustomerList = ({ customers, onCustomerClick }) => (
  <div className="sto-grid-cards">
    {customers.map(customer => {
      const isVip = customer.totalSpent > 10000;
      return (
        <CustomerCard
          key={customer.id}
          customer={{ ...customer, isVip }}
          onClick={onCustomerClick}
        />
      );
    })}
  </div>
);
