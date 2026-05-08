import React from 'react';

export const MaintenanceAlert = ({ lastVisit }) => {
  if (!lastVisit) return null;

  const lastDate = new Date(lastVisit);
  const today = new Date();
  
  const diffTime = Math.abs(today - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays) || diffDays < 180) {
    return null;
  }

  return (
    <div style={{
      background: '#450A0A',
      border: '1px solid #7F1D1D',
      borderRadius: '12px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      <div>
        <h4 style={{ color: '#FECACA', margin: 0, fontSize: '14px', fontWeight: '700' }}>
          Час на планове ТО!
        </h4>
        <p style={{ color: '#FCA5A5', margin: 0, fontSize: '13px' }}>
          Останній візит був {diffDays} днів тому. Рекомендується заміна мастила.
        </p>
      </div>
    </div>
  );
};