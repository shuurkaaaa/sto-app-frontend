import React, { useState, useEffect } from 'react';
import { usePrice } from '../../Context/PriceContext';
import { FullPricePicker } from '../ServiceSelection/FullPricePicker';
import { validateOrderForm, formatPlate } from './validation';
import { OrderStep1 } from './OrderStep1';
import { OrderStep2 } from './OrderStep2';

const initialFormState = {
  client: '', phone: '', car: '', plate: '', vinCode: '', masterId: '',
  status: 'PENDING', payment: 'Готівка', deadline: '', comment: '',
};

export const OrderModal = ({ isOpen, onClose, onSave, masters, initialData }) => {
  const { services } = usePrice();
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(1);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      const plateFromDetails = initialData.carDetails
        ? (initialData.carDetails.match(/\(([^)]+)\)\s*$/)?.[1] || '')
        : '';
      setFormData({
        client: initialData.customer?.name || initialData.client || '',
        phone: initialData.customer?.phone || initialData.phone || '',
        car: initialData.car || (initialData.carDetails ? initialData.carDetails.replace(/\s*\([^)]+\)\s*$/, '') : ''),
        plate: initialData.plate || plateFromDetails || '',
        vinCode: initialData.vinCode || initialData.vin || '',
        masterId: initialData.masterId ? String(initialData.masterId) : '',
        status: initialData.status || 'PENDING',
        payment: initialData.paymentMethod || 'Готівка',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
        comment: initialData.notes || initialData.comment || '',
      });

      if (initialData.services) {
        setSelectedServices(initialData.services);
      } else if (initialData.serviceName) {
        const names = initialData.serviceName.split(', ');
        setSelectedServices(services.filter(s => names.includes(s.name)));
      }

      setIsUrgent(initialData.isUrgent || false);
    } else if (isOpen) {
      setFormData(initialFormState);
      setSelectedServices([]);
      setIsUrgent(false);
    }
  }, [initialData, isOpen, services]);

  if (!isOpen) return null;

  const calculateTotal = () => {
    const raw = selectedServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    return isUrgent ? Math.round(raw * 1.2) : raw;
  };

  const handleNextStep = () => {
    const { isValid, errors: vErrors } = validateOrderForm(formData);
    if (!isValid) { setErrors(vErrors); return; }
    setErrors({});
    setActiveTab(2);
  };

  const handleConfirm = () => {
    if (selectedServices.length === 0) {
      alert('Будь ласка, виберіть хоча б одну послугу');
      return;
    }
    onSave({
      client: formData.client,
      phone: formData.phone,
      car: formData.car,
      plate: formatPlate(formData.plate || ''),
      vinCode: formData.vinCode || null,
      masterId: formData.masterId ? parseInt(formData.masterId) : null,
      status: formData.status,
      payment: formData.payment,
      deadline: formData.deadline,
      comment: formData.comment,
      isUrgent,
      totalPrice: calculateTotal(),
      services: selectedServices.map(s => ({ id: s.id })),
    });
    onClose();
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  };

  const isSubmitDisabled = activeTab === 2 && selectedServices.length === 0;

  return (
    <div className="sto-modal-overlay" onClick={onClose}>
      <div className="sto-modal sto-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="sto-modal-tabs">
          <button
            type="button"
            className={`sto-tab ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => setActiveTab(1)}
          >
            1. Авто та Клієнт
          </button>
          <button
            type="button"
            className={`sto-tab ${activeTab === 2 ? 'active' : ''}`}
            onClick={handleNextStep}
          >
            2. Послуги
          </button>
        </div>

        <div style={{ minHeight: '350px' }}>
          {activeTab === 1 ? (
            <OrderStep1 formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} />
          ) : (
            <OrderStep2
              services={services}
              selectedServices={selectedServices}
              handleServiceClick={toggleService}
              masters={masters}
              formData={formData}
              setFormData={setFormData}
              isUrgent={isUrgent}
              setIsUrgent={setIsUrgent}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setIsPickerOpen={setIsPickerOpen}
            />
          )}
        </div>

        <div className="sto-modal-footer d-flex justify-content-between align-items-center">
          <div>
            <span className="sto-text-muted small me-2">СУМА:</span>
            <span className="text-light fw-bold" style={{ fontSize: '20px' }}>
              {calculateTotal()} грн
            </span>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="sto-btn sto-btn-secondary" onClick={onClose}>Скасувати</button>
            <button
              type="button"
              className={`sto-btn ${isSubmitDisabled ? 'sto-btn-secondary' : 'sto-btn-primary'}`}
              onClick={activeTab === 1 ? handleNextStep : handleConfirm}
              disabled={isSubmitDisabled}
            >
              {activeTab === 1 ? 'Далі' : 'Підтвердити'}
            </button>
          </div>
        </div>
      </div>

      <FullPricePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(service) => { toggleService(service); setIsPickerOpen(false); }}
        selectedServices={selectedServices}
      />
    </div>
  );
};
