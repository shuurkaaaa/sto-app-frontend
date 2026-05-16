import React, { useState, useCallback, useEffect } from 'react';
import vinApi from '../../services/vinApi';

const cleanVin = (v) => (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 17);

export const VINHistoryModal = ({ isOpen, vin, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVINData = useCallback(async () => {
    const raw = (vin || '').trim();
    if (!raw) {
      setError('VIN-код не вказаний');
      return;
    }

    const normalized = cleanVin(raw);
    if (normalized.length < 9) {
      setError('VIN занадто короткий (потрібно мінімум 9 символів після очищення).');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await vinApi.checkComplete(normalized);
    if (result.success) {
      setData(result);
    } else {
      setError(result.error || 'Помилка при отриманні даних');
    }
    setLoading(false);
  }, [vin]);

  useEffect(() => {
    if (isOpen && vin && String(vin).trim()) {
      fetchVINData();
    }
  }, [isOpen, vin, fetchVINData]);

  if (!isOpen) return null;

  const decode = data?.decode;
  const autoRIA = data?.autoRIA;
  const displayVin = data?.vin || cleanVin(vin || '');
  const autoRiaMileage = autoRIA?.mileage
    ? (typeof autoRIA.mileage === 'number' ? `${autoRIA.mileage.toLocaleString('uk-UA')} км` : autoRIA.mileage)
    : null;

  const conditionFlags = autoRIA ? [
    {
      key: 'damage',
      value: autoRIA.damage,
      labelTrue: 'Є ознаки ДТП / пошкоджень',
      labelFalse: 'ДТП / пошкоджень не зафіксовано',
      severityTrue: 'danger',
      severityFalse: 'success',
    },
    {
      key: 'onRepairParts',
      value: autoRIA.onRepairParts,
      labelTrue: 'Продавалось на запчастини / після ремонту',
      labelFalse: 'Не зафіксовано продажу на запчастини',
      severityTrue: 'warning',
      severityFalse: 'success',
    },
    {
      key: 'underCredit',
      value: autoRIA.underCredit,
      labelTrue: 'Під кредитом / заставою',
      labelFalse: 'Не під кредитом',
      severityTrue: 'warning',
      severityFalse: 'success',
    },
    {
      key: 'confiscatedCar',
      value: autoRIA.confiscatedCar,
      labelTrue: 'У конфіскації / арешт',
      labelFalse: 'Не у конфіскації',
      severityTrue: 'danger',
      severityFalse: 'success',
    },
    {
      key: 'abroad',
      value: autoRIA.abroad,
      labelTrue: 'Знаходиться за кордоном',
      labelFalse: 'Знаходиться в Україні',
      severityTrue: 'info',
      severityFalse: 'success',
    },
  ] : [];

  const knownConditionFlags = conditionFlags.filter((flag) => flag.value === true || flag.value === false);
  const hasConditionData = Boolean(
    autoRIA && (
      autoRIA.technicalConditionTitle ||
      autoRIA.technicalConditionAnnotation ||
      autoRIA.technicalChecked != null ||
      autoRIA.haveInfotechReport != null ||
      knownConditionFlags.length > 0
    )
  );

  const severityToBg = {
    danger: 'rgba(220, 53, 69, 0.12)',
    warning: 'rgba(255, 193, 7, 0.12)',
    success: 'rgba(40, 167, 69, 0.12)',
    info: 'rgba(13, 202, 240, 0.12)',
  };
  const severityToBorder = {
    danger: 'rgba(220, 53, 69, 0.4)',
    warning: 'rgba(255, 193, 7, 0.4)',
    success: 'rgba(40, 167, 69, 0.4)',
    info: 'rgba(13, 202, 240, 0.4)',
  };
  const severityToText = {
    danger: '#ff6b81',
    warning: '#ffd966',
    success: '#7be39c',
    info: '#7ed9f5',
  };

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal sto-modal-lg" onClick={(e) => e.stopPropagation()}>
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
                  {displayVin}
                </p>
              </div>
              <div className="col-md-6">
                <p className="sto-label small">РОЗШИФРОВКА</p>
                {decode?.success ? (
                  <span className="badge bg-success">Є дані</span>
                ) : (
                  <span className="badge bg-secondary">Немає повної розшифровки</span>
                )}
              </div>
            </div>

            {decode?.success && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <p className="sto-label small">МАРКА</p>
                  <p className="mb-0">{decode.make || '—'}</p>
                </div>
                <div className="col-md-4">
                  <p className="sto-label small">МОДЕЛЬ</p>
                  <p className="mb-0">{decode.model || '—'}</p>
                </div>
                <div className="col-md-4">
                  <p className="sto-label small">РІК</p>
                  <p className="mb-0">{decode.year || decode.estimatedYear || '—'}</p>
                </div>
              </div>
            )}

            {decode && !decode.success && decode.error && (
              <div className="alert alert-warning small mb-3" role="alert">
                {decode.error}
              </div>
            )}

            {autoRIA?.found && (
              <div className="mb-3 p-3 rounded-2" style={{ background: 'var(--sto-bg)', border: '1px solid var(--sto-border)' }}>
                <p className="sto-label small mb-2">AUTO.RIA</p>
                <p className="mb-1 text-light fw-semibold">{autoRIA.description || `${autoRIA.brand} ${autoRIA.model}`}</p>
                <p className="small sto-text-muted mb-2">
                  {autoRIA.year != null && `Рік: ${autoRIA.year}`}
                  {autoRiaMileage && ` · Пробіг: ${autoRiaMileage}`}
                  {autoRIA.region != null && ` · ${autoRIA.region}`}
                </p>
                {(autoRIA.body || autoRIA.fuel || autoRIA.gearbox) && (
                  <p className="small sto-text-muted mb-2">
                    {[autoRIA.body, autoRIA.fuel, autoRIA.gearbox].filter(Boolean).join(' · ')}
                  </p>
                )}
                {autoRIA.priceUsd && (
                  <p className="small sto-text-muted mb-2">
                    Орієнтовна ціна: {autoRIA.priceUsd} $
                  </p>
                )}
                {autoRIA.engineVolume && (
                  <p className="small sto-text-muted mb-2">
                    {autoRIA.engineVolume}
                  </p>
                )}
                {autoRIA.url && (
                  <a href={autoRIA.url} target="_blank" rel="noopener noreferrer" className="small">
                    {autoRIA.linkText || 'Відкрити оголошення'}
                  </a>
                )}
              </div>
            )}

            {hasConditionData && (
              <div
                className="mb-3 p-3 rounded-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,53,69,0.08), rgba(13,202,240,0.06))',
                  border: '1px solid var(--sto-border)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="sto-label small mb-1">ДТП / РЕМОНТИ / СТАН АВТО</p>
                    <p className="mb-0 small sto-text-muted">
                      Дані за оголошеннями та звітами AUTO.RIA
                    </p>
                  </div>
                  {autoRIA?.technicalChecked === true && (
                    <span className="badge bg-success">Перевірено технічно</span>
                  )}
                </div>

                {autoRIA?.technicalConditionTitle && (
                  <div
                    className="p-2 rounded-2 mb-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderLeft: '3px solid var(--sto-primary, #4dabf7)',
                    }}
                  >
                    <p className="mb-1 text-light fw-semibold">{autoRIA.technicalConditionTitle}</p>
                    {autoRIA.technicalConditionAnnotation && (
                      <p className="small sto-text-muted mb-0">{autoRIA.technicalConditionAnnotation}</p>
                    )}
                  </div>
                )}

                {knownConditionFlags.length > 0 && (
                  <div className="row g-2 mb-2">
                    {knownConditionFlags.map((flag) => {
                      const isTrue = flag.value === true;
                      const severity = isTrue ? flag.severityTrue : flag.severityFalse;
                      const label = isTrue ? flag.labelTrue : flag.labelFalse;
                      return (
                        <div key={flag.key} className="col-md-6">
                          <div
                            className="p-2 rounded-2 h-100 d-flex align-items-center"
                            style={{
                              background: severityToBg[severity],
                              border: `1px solid ${severityToBorder[severity]}`,
                            }}
                          >
                            <span
                              className="small fw-semibold"
                              style={{ color: severityToText[severity] }}
                            >
                              {label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-2">
                  {autoRIA?.haveInfotechReport === true && (
                    <span className="badge bg-primary">Доступний InfoTech-звіт</span>
                  )}
                  {autoRIA?.haveInfotechReport === false && (
                    <span className="badge bg-secondary">InfoTech-звіт відсутній</span>
                  )}
                  {autoRIA?.checkedVin?.vin && (
                    <span className="badge bg-info text-dark">VIN-check у AUTO.RIA</span>
                  )}
                </div>

                {knownConditionFlags.length === 0 && !autoRIA?.technicalConditionTitle && (
                  <p className="small sto-text-muted mb-0 mt-2">
                    Деталі по ДТП/ремонтам у відкритих даних AUTO.RIA відсутні. Зазвичай це означає,
                    що офіційних звітів про пошкодження немає, або їх не оприлюднено.
                  </p>
                )}
              </div>
            )}

            {autoRIA?.checkedVin?.vin && (
              <div className="mb-3 p-3 rounded-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="sto-label small mb-2">VIN-check в AUTO.RIA</p>
                <p className="mb-1 text-light" style={{ fontFamily: 'monospace' }}>{autoRIA.checkedVin.vin}</p>
                {autoRIA.checkedVin.orderId ? (
                  <p className="small sto-text-muted mb-0">ID перевірки: {autoRIA.checkedVin.orderId}</p>
                ) : (
                  <p className="small sto-text-muted mb-0">AUTO.RIA показує наявність VIN-check без окремої історії подій.</p>
                )}
              </div>
            )}

            {autoRIA?.sellerDescription && (
              <div className="mb-3 p-3 rounded-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="sto-label small mb-2">Опис продавця / доступна історія</p>
                <p className="small text-light mb-0" style={{ whiteSpace: 'pre-wrap' }}>{autoRIA.sellerDescription}</p>
              </div>
            )}

            {autoRIA?.requiresSetup && (
              <div className="alert alert-warning mb-0" role="alert">
                <p className="m-0 small">
                  {autoRIA.error}
                </p>
              </div>
            )}

            {!autoRIA?.requiresSetup && autoRIA && !autoRIA.found && autoRIA.error && (
              <div className="alert alert-warning mb-0" role="alert">
                <p className="m-0 small">{autoRIA.error}</p>
              </div>
            )}

            {(!autoRIA || (!autoRIA.found && !autoRIA.requiresSetup && !autoRIA.error)) && (
              <div className="alert alert-info mb-0" role="alert">
                <p className="m-0 small">
                  Історія ТО з зовнішніх джерел для цього VIN не підтягується автоматично. Є розшифровка та (за наявності) дані з autoRIA.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="sto-divider my-3" />

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="sto-btn sto-btn-secondary" onClick={onClose}>
            Закрити
          </button>
          {!loading && (
            <button type="button" className="sto-btn sto-btn-primary" onClick={fetchVINData}>
              Оновити
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
