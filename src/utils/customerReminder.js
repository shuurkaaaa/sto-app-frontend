export const checkCustomerServiceReminder = (customer) => {
  if (!customer || !customer.orders || customer.orders.length === 0) {
    return {
      needsReminder: false,
      daysSinceService: null,
      message: 'Новий клієнт'
    };
  }

  const completedOrders = customer.orders.filter(o =>
    o.status === 'COMPLETED' || o.status === 'Завершено'
  );

  if (completedOrders.length === 0) {
    return {
      needsReminder: false,
      daysSinceService: null,
      message: 'Немає завершених замовлень'
    };
  }

  const lastOrder = completedOrders.reduce((latest, order) => {
    const latestDate = latest.completedAt
      ? new Date(latest.completedAt).getTime()
      : new Date(latest.createdAt).getTime();
    const orderDate = order.completedAt
      ? new Date(order.completedAt).getTime()
      : new Date(order.createdAt).getTime();
    return orderDate > latestDate ? order : latest;
  });

  const dateStr = lastOrder.completedAt || lastOrder.createdAt;
  if (!dateStr || isNaN(new Date(dateStr).getTime())) {
    return {
      needsReminder: false,
      daysSinceService: null,
      message: 'Невалідна дата обслуговування'
    };
  }

  const lastServiceDate = new Date(dateStr);
  const now = new Date();
  const daysSinceService = Math.floor((now - lastServiceDate) / (1000 * 60 * 60 * 24));
  const monthsSinceService = Math.floor(daysSinceService / 30);

  const SIX_MONTHS_IN_DAYS = 180;
  const needsReminder = daysSinceService > SIX_MONTHS_IN_DAYS;

  return {
    needsReminder,
    daysSinceService,
    monthsSinceService,
    lastServiceDate: lastServiceDate.toLocaleDateString('uk-UA'),
    message: needsReminder
      ? `ТО потрібне. Останнє обслуговування ${monthsSinceService} місяців тому (${lastServiceDate.toLocaleDateString('uk-UA')})`
      : `Останнє обслуговування ${daysSinceService} днів тому`
  };
};
