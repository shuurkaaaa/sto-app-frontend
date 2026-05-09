import React from 'react';

export const ProfitForecast = ({ items }) => {
  const marginPercentage = 0.35;
  const potentialProfit = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * marginPercentage * Number(item.current || 0),
    0
  );

  return (
    <div className="sto-card-sm">
      <div className="sto-text-accent fw-bold" style={{ fontSize: '11px' }}>ПРОГНОЗ ПРИБУТКУ</div>
      <div className="text-light fw-bold" style={{ fontSize: '20px' }}>
        ~{Math.round(potentialProfit).toLocaleString()} грн
      </div>
    </div>
  );
};
