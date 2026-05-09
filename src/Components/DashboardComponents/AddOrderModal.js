import React, { useState, useMemo, useEffect } from 'react';
import { useOrders } from '../../Context/OrdersContext';
import { usePrice } from '../../Context/PriceContext';
import { useInventoryContext } from '../../Context/InventoryContext';
import { useWorkers } from '../../Context/WorkersContext';

export const AddOrderModal = ({ isOpen, onClose, orderToEdit = null }) => {
  const { addOrder, updateOrder } = useOrders();
  const { services } = usePrice();
  const { items: inventoryItems } = useInventoryContext();
  const { workers } = useWorkers();

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  const [formData, setFormData] = useState({
    car: '', plate: '', client: '', phone: '', masterId: '',
  });
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (orderToEdit) {
        setFormData({
          car: orderToEdit.carDetails?.split(' (')[0] || orderToEdit.car || '',
          plate: orderToEdit.plate || orderToEdit.carDetails?.match(/\((.*?)\)/)?.[1] || '',
          client: orderToEdit.customer?.name || orderToEdit.client || '',
          phone: orderToEdit.customer?.phone || orderToEdit.phone || '',
          masterId: orderToEdit.masterId || '',
        });
        setSelectedServices(orderToEdit.services || []);
        setIsUrgent(orderToEdit.isUrgent || false);
      } else {
        setFormData({ car: '', plate: '', client: '', phone: '', masterId: '' });
        setSelectedServices([]);
        setIsUrgent(false);
        setStep(1);
        setShowCatalog(false);
      }
    }
  }, [isOpen, orderToEdit]);

  const totalAmount = useMemo(() => {
    const base = selectedServices.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    return isUrgent ? Math.round(base * 1.2) : base;
  }, [selectedServices, isUrgent]);

  if (!isOpen) return null;

  const handleServiceClick = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleConfirm = async () => {
    const finalData = {
      ...formData,
      services: selectedServices,
      totalPrice: totalAmount,
      isUrgent,
      status: orderToEdit ? orderToEdit.status : 'PENDING',
    };
    try {
      if (orderToEdit && orderToEdit.id) {
        await updateOrder(orderToEdit.id, finalData);
      } else {
        await addOrder(finalData);
      }
      onClose();
    } catch (error) {
      console.error('Помилка збереження:', error);
    }
  };

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal" style={{ width: '500px' }}>
        <div className="sto-modal-tabs">
          <div
            className={`sto-tab ${step === 1 ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStep(1)}
          >
            1. Авто та Клієнт
          </div>
          <div
            className={`sto-tab ${step === 2 ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStep(2)}
          >
            2. Послуги
          </div>
        </div>

        <div className="py-3">
          {step === 1 ? (
            <div>
              <p className="sto-label">АВТОМОБІЛЬ:</p>
              <input className="sto-input mb-2" placeholder="Марка та модель" value={formData.car} onChange={e => setFormData({ ...formData, car: e.target.value })} />
              <p className="sto-label">ДЕРЖ. НОМЕР:</p>
              <input className="sto-input mb-2" placeholder="AA 0000 BB" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} />
              <p className="sto-label">КЛІЄНТ:</p>
              <input className="sto-input mb-2" placeholder="ПІБ клієнта" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
              <p className="sto-label">ТЕЛЕФОН:</p>
              <input className="sto-input mb-2" placeholder="050..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <button className="sto-btn sto-btn-primary w-100" onClick={() => setStep(2)}>Далі до послуг</button>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <p className="sto-label m-0">ВИБРАНІ ПОСЛУГИ ({selectedServices.length}):</p>
                <button onClick={() => setShowCatalog(!showCatalog)} className="sto-btn sto-btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                  {showCatalog ? 'Приховати' : 'Показати каталог'}
                </button>
              </div>

              {showCatalog && (
                <>
                  <input className="sto-input mb-2" placeholder="Пошук послуги..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="mb-3">
                    {services
                      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(service => {
                        const stockItem = inventoryItems.find(item => item.name.toLowerCase() === service.name.toLowerCase());
                        const isSelected = !!selectedServices.find(s => s.id === service.id);
                        return (
                          <div
                            key={service.id}
                            onClick={() => handleServiceClick(service)}
                            className="p-2 mb-2 rounded-3 d-flex justify-content-between"
                            style={{
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #818CF8' : '1px solid var(--sto-border)',
                              background: isSelected ? 'var(--sto-bg)' : 'var(--sto-bg-2)',
                            }}
                          >
                            <div>
                              <span className="sto-text-muted small">{service.category}</span>
                              <div className="fw-bold" style={{ fontSize: '14px' }}>{service.name}</div>
                              {stockItem && (
                                <div className={stockItem.current > 0 ? 'sto-text-success' : 'sto-text-danger'} style={{ fontSize: '11px' }}>
                                  Залишок: {stockItem.current} шт.
                                </div>
                              )}
                            </div>
                            <div className="fw-bold">{service.price} грн</div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}

              {!showCatalog && selectedServices.length > 0 && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="mb-3">
                  {selectedServices.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleServiceClick(s)}
                      className="p-2 mb-2 rounded-3 d-flex justify-content-between"
                      style={{ cursor: 'pointer', border: '2px solid #818CF8', background: 'var(--sto-bg)' }}
                    >
                      <div className="fw-bold">{s.name}</div>
                      <div className="fw-bold">{s.price} грн</div>
                    </div>
                  ))}
                </div>
              )}

              <p className="sto-label">ПРИЗНАЧИТИ МАЙСТРА:</p>
              <select className="sto-select mb-2" value={formData.masterId} onChange={e => setFormData({ ...formData, masterId: e.target.value })}>
                <option value="">Не призначено</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>

              <div className="d-flex align-items-center gap-2 mt-3">
                <input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} id="urgent" />
                <label htmlFor="urgent" className="text-light fw-bold small m-0">Терміново (+20%)</label>
              </div>
            </div>
          )}
        </div>

        <div className="sto-modal-footer d-flex justify-content-between align-items-center">
          <div>
            <div className="sto-text-muted small">СУМА:</div>
            <div className="sto-text-success fw-bold" style={{ fontSize: '24px' }}>{totalAmount} грн</div>
          </div>
          <div className="d-flex gap-2">
            <button className="sto-btn sto-btn-secondary" onClick={onClose}>Скасувати</button>
            <button
              className={`sto-btn ${totalAmount > 0 ? 'sto-btn-primary' : 'sto-btn-secondary'}`}
              disabled={totalAmount === 0}
              onClick={handleConfirm}
            >
              {orderToEdit ? 'Зберегти' : 'Підтвердити'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
