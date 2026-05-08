import React from 'react';
import { customerStyles } from './CustomerStyles';
import { CarBrandIcon } from './CarBrandIcon';

export const CustomerCarList = ({ cars, customerId, onDeleteCar }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ 
        marginBottom: '15px', 
        color: '#94A3B8', 
        borderBottom: '2px solid #334155', 
        paddingBottom: '5px' 
      }}>
        Автопарк клієнта
      </h4>
      
      {cars && cars.length > 0 ? (
        cars.map((car, idx) => (
          <div key={idx} style={customerStyles.carBadge}>
            <CarBrandIcon brandName={car.brand} />
            
            <div style={{ flex: 1, marginLeft: '10px' }}>
              <b style={{ fontSize: '15px', color: '#F1F5F9' }}>{car.brand} {car.model}</b> <br/>
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                Номер: <b style={{ color: '#F1F5F9' }}>{car.plate}</b>
              </span>
            </div>
            
            <button 
              type="button"
              onClick={() => onDeleteCar && onDeleteCar(customerId, car.id)}
              style={{
                background: '#450A0A',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                color: '#FCA5A5',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#7F1D1D'}
              onMouseOut={(e) => e.currentTarget.style.background = '#450A0A'}
            >
              Видалити
            </button>
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>
          Автомобілі не додані
        </div>
      )}
    </div>
  );
};