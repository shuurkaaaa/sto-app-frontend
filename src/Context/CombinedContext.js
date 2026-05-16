import React from 'react';
import { InventoryProvider } from './InventoryContext';
import { WorkersProvider } from './WorkersContext';
import { OrdersProvider } from './OrdersContext';
import { PriceProvider } from './PriceContext';
import { AnalyticsProvider } from './AnalyticsContext';
import { NotificationsProvider } from './NotificationsContext';
import { ClientsProvider } from './ClientsContext';

export const CombinedProvider = ({ children }) => {
  return (
    <InventoryProvider>
      <ClientsProvider>
        <WorkersProvider>
          <PriceProvider>
            <AnalyticsProvider>
              <OrdersProvider>
                <NotificationsProvider>
                  {children}
                </NotificationsProvider>
              </OrdersProvider>
            </AnalyticsProvider>
          </PriceProvider>
        </WorkersProvider>
      </ClientsProvider>
    </InventoryProvider>
  );
};
