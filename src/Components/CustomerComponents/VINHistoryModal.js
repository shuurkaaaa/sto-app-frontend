import React, { useState, useCallback, useEffect } from 'react';
import vinApi from '../../services/vinApi';

export const VINHistoryModal = ({ isOpen, vin, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ НЕ спробуємо завантажити дані якщо VIN пустий
  const fetchVINData = useCallback(async () => {
    if (!vin || vin.trim().length === 0) {
      setError('VIN-код не вказаний');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await vinApi.checkComplete(vin);
    if (result.success) {
      setData(result);
    } else {
      setError(result.error || 'Помилка при отриманні даних');
    }
    setLoading(false);
  }, [vin]);

  useEffect(() => {
    if (isOpen && vin) {
      fetchVINData();
    }
  }, [isOpen, vin, fetchVINData]);

  if (!isOpen) return null;

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal sto-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0">Перевірка VIN-коду</h4>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="sto-divider mb-3" />

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="sto-text-muted">Обробка VIN-коду...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            <strong>Помилка:</strong> {error}
          </div>
        )}

        {data && !loading && (
          <div>
            <div className="row mb-4">
              <div className="col-md-6">
                <p className="sto-label small">VIN-КОД</p>
                <p className="mb-0 fw-bold" style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                  {data.decode?.vin || vin}
                </p>
              </div>
              <div className="col-md-6">
                <p className="sto-label small">СТАТУС</p>
                {data.validation?.valid ? (
                  <span className="badge bg-success">✓ Валідний</span>
                ) : (
                  <span className="badge bg-danger">✗ Невалідний</span>
                )}
              </div>
            </div>

            {data.decode?.success && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <p className="sto-label small">МАРКА</p>
                  <p className="mb-0">{data.decode?.make || 'Unknown'}</p>
                </div>
                <div className="col-md-4">
                  <p className="sto-label small">МОДЕЛЬ</p>
                  <p className="mb-0">{data.decode?.model || 'Unknown'}</p>
                </div>
                <div className="col-md-4">
                  <p className="sto-label small">РІК</p>
                  <p className="mb-0">{data.decode?.year || data.decode?.estimatedYear || 'Unknown'}</p>
                </div>
              </div>
            )}

            {data.history && data.history.length > 0 && (
              <div>
                <p className="sto-label small mb-3">ІСТОРІЯ ОБСЛУГОВУВАННЯ</p>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {data.history.map((service, idx) => (
                    <div
                      key={idx}
                      className="p-3 mb-2 rounded-2"
                      style={{ background: 'var(--sto-bg)', border: '1px solid var(--sto-border)' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <p className="m-0 fw-bold text-light">{service.service}</p>
                          <small className="sto-text-muted">
                            {new Date(service.date).toLocaleDateString('uk-UA')}
                          </small>
                        </div>
                        <span className="badge bg-info">
                          {service.mileage.toLocaleString()} км
                        </span>
                      </div>
                      {service.notes && (
                        <p className="m-0 small sto-text-muted">{service.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!data.history || data.history.length === 0) && (
              <div className="alert alert-info mb-0" role="alert">
                <p className="m-0 small">Історія обслуговування для цього VIN недоступна</p>
              </div>
            )}
          </div>
        )}

        <div className="sto-divider my-3" />

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="sto-btn sto-btn-secondary"
            onClick={onClose}
          >
            Закрити
          </button>
          {!loading && (
            <button
              type="button"
              className="sto-btn sto-btn-primary"
              onClick={fetchVINData}
            >
              Оновити
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
