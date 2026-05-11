import React, { useState } from 'react';
import { CarBrandIcon } from './CarBrandIcon';
import { VINHistoryModal } from './VINHistoryModal';

export const CustomerCarList = ({ cars, customerId, onDeleteCar }) => {
  const [selectedVIN, setSelectedVIN] = useState(null);

  return (
    <>
      <div className="mb-4">
        <h4
          className="sto-text-muted mb-3 pb-1"
          style={{ borderBottom: '2px solid var(--sto-border)' }}
        >
          Автопарк клієнта
        </h4>

        {cars && cars.length > 0 ? (
          cars.map((car, idx) => (
            <div key={idx} className="sto-car-badge">
              <CarBrandIcon brandName={car.brand} />

              <div className="flex-grow-1 ms-2">
                <b className="text-light">{car.brand} {car.model}</b><br />
                <span className="sto-text-muted small">
                  Номер: <b className="text-light">{car.plate}</b>
                </span>
                {car.vin && (
                  <>
                    <br />
                    <button
                      type="button"
                      className="sto-link-btn small"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedVIN(car.vin);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#60a5fa',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      VIN: <b style={{ fontFamily: 'monospace' }}>{car.vin}</b> (натисніть для перегляду історії)
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDeleteCar && onDeleteCar(customerId, car.id)}
                className="border-0 rounded-2"
                style={{ background: '#450A0A', color: '#FCA5A5', padding: '8px 12px' }}
              >
                Видалити
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4 fst-italic" style={{ color: '#475569' }}>
            Автомобілі не додані
          </div>
        )}
      </div>

      <VINHistoryModal
        isOpen={!!selectedVIN}
        vin={selectedVIN}
        onClose={() => setSelectedVIN(null)}
      />
    </>
  );
};
