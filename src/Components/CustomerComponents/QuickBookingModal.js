import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { usePrice } from '../../Context/PriceContext';
import { useOrders } from '../../Context/OrdersContext';
import { useWorkers } from '../../Context/WorkersContext';

const getDefaultDateTime = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const QuickBookingModal = ({ isOpen, onClose, customer }) => {
  const { services } = usePrice();
  const { addOrder } = useOrders();
  const { workers } = useWorkers();

  const cars = customer?.cars || [];

  const [selectedCarPlate, setSelectedCarPlate] = useState('');
  const [manualCar, setManualCar] = useState({ car: '', plate: '' });
  const [serviceId, setServiceId] = useState('');
  const [deadline, setDeadline] = useState(getDefaultDateTime());
  const [masterId, setMasterId] = useState('');
  const [payment, setPayment] = useState('Готівка');
  const [isUrgent, setIsUrgent] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCarPlate(cars[0]?.plate || '');
      setManualCar({ car: '', plate: '' });
      setServiceId('');
      setDeadline(getDefaultDateTime());
      setMasterId('');
      setPayment('Готівка');
      setIsUrgent(false);
      setComment('');
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customer?.id]);

  const selectedService = useMemo(
    () => services.find(s => String(s.id) === String(serviceId)),
    [services, serviceId]
  );

  const totalPrice = useMemo(() => {
    const base = Number(selectedService?.price) || 0;
    return isUrgent ? Math.round(base * 1.2) : base;
  }, [selectedService, isUrgent]);

  if (!isOpen) return null;

  const isManual = !cars.length || selectedCarPlate === '__manual__';

  const handleConfirm = async () => {
    if (!selectedService) {
      toast.error('Оберіть послугу');
      return;
    }

    let car = '';
    let plate = '';
    if (isManual) {
      car = manualCar.car.trim();
      plate = manualCar.plate.trim();
      if (!car || !plate) {
        toast.error('Вкажіть марку/модель та держ. номер авто');
        return;
      }
    } else {
      const found = cars.find(c => c.plate === selectedCarPlate);
      if (!found) {
        toast.error('Оберіть авто');
        return;
      }
      car = `${found.brand} ${found.model}`.trim();
      plate = found.plate;
    }

    const payload = {
      client: customer?.name || '',
      phone: customer?.phone || '',
      car,
      plate,
      services: [{ id: selectedService.id, name: selectedService.name, price: selectedService.price }],
      totalPrice,
      payment,
      deadline,
      comment,
      masterId: masterId || null,
      isUrgent,
    };

    try {
      setSubmitting(true);
      await addOrder(payload);
      toast.success('Запис додано в журнал замовлень');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Не вдалося створити запис');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <h3 className="text-light mb-3">Швидкий запис</h3>

        <div className="sto-form-group">
          <label className="sto-label">Клієнт</label>
          <div className="rounded-3 p-3 border" style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}>
            <b className="text-light">{customer?.name}</b> <span className="sto-text-muted">({customer?.phone})</span>
          </div>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Автомобіль</label>
          {cars.length > 0 && (
            <select
              className="sto-select mb-2"
              value={selectedCarPlate}
              onChange={e => setSelectedCarPlate(e.target.value)}
            >
              {cars.map(c => (
                <option key={c.plate} value={c.plate}>
                  {c.brand} {c.model} ({c.plate})
                </option>
              ))}
              <option value="__manual__">Інше авто...</option>
            </select>
          )}
          {isManual && (
            <div className="d-flex gap-2">
              <input
                className="sto-input"
                placeholder="Марка та модель"
                value={manualCar.car}
                onChange={e => setManualCar({ ...manualCar, car: e.target.value })}
              />
              <input
                className="sto-input"
                placeholder="Держ. номер"
                value={manualCar.plate}
                onChange={e => setManualCar({ ...manualCar, plate: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Дата та час</label>
          <input
            type="datetime-local"
            className="sto-input"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Послуга</label>
          <select
            className="sto-select"
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
          >
            <option value="">— Оберіть послугу —</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.price} грн
              </option>
            ))}
          </select>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Майстер</label>
          <select
            className="sto-select"
            value={masterId}
            onChange={e => setMasterId(e.target.value)}
          >
            <option value="">Не призначено</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Спосіб оплати</label>
          <select
            className="sto-select"
            value={payment}
            onChange={e => setPayment(e.target.value)}
          >
            <option value="Готівка">Готівка</option>
            <option value="Картка">Картка</option>
            <option value="Безготівковий">Безготівковий</option>
          </select>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Коментар</label>
          <textarea
            className="sto-input"
            rows={2}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Додаткова інформація..."
          />
        </div>

        <div className="d-flex align-items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="qb-urgent"
            checked={isUrgent}
            onChange={() => setIsUrgent(!isUrgent)}
          />
          <label htmlFor="qb-urgent" className="text-light fw-bold small m-0">
            Терміново (+20%)
          </label>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2 mb-3">
          <div className="sto-text-muted small">СУМА:</div>
          <div className="sto-text-success fw-bold" style={{ fontSize: '20px' }}>
            {totalPrice} грн
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="sto-btn sto-btn-secondary flex-grow-1"
          >
            Скасувати
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || !selectedService}
            className="sto-btn sto-btn-primary flex-grow-1"
          >
            {submitting ? 'Збереження...' : 'Підтвердити'}
          </button>
        </div>
      </div>
    </div>
  );
};
