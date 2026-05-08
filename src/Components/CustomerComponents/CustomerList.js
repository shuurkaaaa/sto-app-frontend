import React from 'react';
import { customerStyles } from './CustomerStyles';
import { CustomerCard } from './CustomerCard';

export const CustomerList = ({ customers, onCustomerClick }) => (
  <div style={customerStyles.grid}>
    {customers.map(customer => {
      const isVip = customer.totalSpent > 10000;
      
      return (
        <CustomerCard 
          key={customer.id} 
          customer={{...customer, isVip}} 
          onClick={onCustomerClick} 
        />
      );
    })}
  </div>
);