import React, { useState, useEffect } from 'react';
import { usePrice } from '../../Context/PriceContext';
import { FullPricePicker } from '../ServiceSelection/FullPricePicker';
import { validateOrderForm, formatPlate } from './validation';
import { OrderStep1 } from './OrderStep1';
import { OrderStep2 } from './OrderStep2';
import { dashboardStyles as defaultStyles } from './DashboardStyles';

const initialFormState = { 
  client: '', 
  phone: '', 
  car: '', 
  plate: '', 
  masterId: '', 
  status: 'PENDING',
  payment: 'Готівка',
  deadline: '',
  comment: ''
};

export const OrderModal = ({ isOpen, onClose, onSave, masters, initialData, styles = defaultStyles }) => {
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
      setFormData({ 
        client: initialData.customer?.name || initialData.client || '',
        phone: initialData.customer?.phone || initialData.phone || '',
        car: initialData.car || (initialData.carDetails ? initialData.carDetails.split(' (')[0] : ''),
        plate: initialData.plate || '',
        masterId: initialData.masterId ? String(initialData.masterId) : '',
        status: initialData.status || 'PENDING',
        payment: initialData.paymentMethod || 'Готівка',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : '',
        comment: initialData.notes || initialData.comment || ''
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
    if (!isValid) { 
      setErrors(vErrors); 
      return; 
    }
    setErrors({}); 
    setActiveTab(2);
  };

  const handleConfirm = () => {
    if (selectedServices.length === 0) {
      alert("Будь ласка, виберіть хоча б одну послугу");
      return;
    }

    onSave({
      client: formData.client,
      phone: formData.phone,
      car: formData.car,
      plate: formatPlate(formData.plate || ""),
      masterId: formData.masterId ? parseInt(formData.masterId) : null,
      status: formData.status,
      payment: formData.payment,
      deadline: formData.deadline,
      comment: formData.comment,
      isUrgent: isUrgent,
      totalPrice: calculateTotal(),
      services: selectedServices.map(s => ({ id: s.id }))
    });
    onClose();
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const isSubmitDisabled = activeTab === 2 && selectedServices.length === 0;

  return (
    <div style={styles.modal.overlay} onClick={onClose}>
      <div style={{...styles.modal.container, maxWidth: '650px'}} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modal.tabs}>
          <button 
            type="button"
            style={activeTab === 1 ? styles.modal.tabActive : styles.modal.tabInactive} 
            onClick={() => setActiveTab(1)}
          >
            1. Авто та Клієнт
          </button>
          <button 
            type="button"
            style={activeTab === 2 ? styles.modal.tabActive : styles.modal.tabInactive} 
            onClick={handleNextStep}
          >
            2. Послуги
          </button>
        </div>

        <div style={styles.modal.content}>
          {activeTab === 1 ? (
            <OrderStep1 
              formData={formData} 
              setFormData={setFormData} 
              errors={errors} 
              setErrors={setErrors}
              styles={styles} 
            />
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
              styles={styles} 
            />
          )}
        </div>

        <div style={styles.modal.footer}>
          <div style={styles.modal.totalSum}>
            <span style={{ color: '#94A3B8', fontSize: '14px', marginRight: '8px' }}>СУМА:</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#F8FAFC' }}>
              {calculateTotal()} грн
            </span>
          </div>
          <div style={styles.modal.buttonGroup}>
            <button type="button" style={styles.modal.cancelBtn} onClick={onClose}>Скасувати</button>
            <button 
              type="button"
              style={isSubmitDisabled ? styles.modal.submitBtnDisabled : styles.modal.submitBtnActive}
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
        onSelect={(service) => {
          toggleService(service);
          setIsPickerOpen(false); 
        }} 
        selectedServices={selectedServices} 
      />
    </div>
  );
};