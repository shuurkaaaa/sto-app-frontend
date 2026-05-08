import React from 'react';

export const ProfitForecast = ({ items }) => {
  const marginPercentage = 0.35; // Приблизна маржа 35%
  
  const potentialProfit = items.reduce((accumulator, item) => {
    return accumulator + (Number(item.price || 0) * marginPercentage * Number(item.current || 0));
  }, 0);

  return (
    <div style={{ backgroundColor: '#1E293B', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
      <div style={{ fontSize: '11px', color: '#818CF8', fontWeight: 'bold' }}>ПРОГНОЗ ПРИБУТКУ</div>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#F1F5F9' }}>
        ~{Math.round(potentialProfit).toLocaleString()} грн
      </div>
    </div>
  );
};