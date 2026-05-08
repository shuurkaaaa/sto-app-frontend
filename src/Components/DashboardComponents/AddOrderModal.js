import React, { useState, useMemo, useEffect } from 'react';
import { useOrders } from '../../Context/OrdersContext';
import { usePrice } from '../../Context/PriceContext';
import { useInventoryContext } from '../../Context/InventoryContext';
import { useWorkers } from '../../Context/WorkersContext';

export const AddOrderModal = ({ isOpen, onClose, orderToEdit = null }) => {
  const { addOrder, updateOrder } = useOrders();
  const { services } = usePrice(); 
  const { items: inventoryItems } = useInventoryContext(); // ТЕПЕР ВИКОРИСТОВУЄТЬСЯ
  const { workers } = useWorkers();

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false); 
  
  const [formData, setFormData] = useState({
    car: '',
    plate: '',
    client: '',
    phone: '',
    masterId: ''
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
          masterId: orderToEdit.masterId || ''
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
      isUrgent: isUrgent,
      status: orderToEdit ? orderToEdit.status : 'PENDING'
    };

    try {
      if (orderToEdit && orderToEdit.id) {
        await updateOrder(orderToEdit.id, finalData);
      } else {
        await addOrder(finalData);
      }
      onClose();
    } catch (error) {
      console.error("Помилка збереження:", error);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.tabs}>
          <div style={step === 1 ? styles.activeTab : styles.tab} onClick={() => setStep(1)}>1. Авто та Клієнт</div>
          <div style={step === 2 ? styles.activeTab : styles.tab} onClick={() => setStep(2)}>2. Послуги</div>
        </div>

        <div style={styles.body}>
          {step === 1 ? (
            <div style={styles.stepContent}>
              <p style={styles.label}>АВТОМОБІЛЬ:</p>
              <input style={styles.input} placeholder="Марка та модель" value={formData.car} onChange={e => setFormData({...formData, car: e.target.value})} />
              <p style={styles.label}>ДЕРЖ. НОМЕР:</p>
              <input style={styles.input} placeholder="AA 0000 BB" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
              <p style={styles.label}>КЛІЄНТ:</p>
              <input style={styles.input} placeholder="ПІБ клієнта" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              <p style={styles.label}>ТЕЛЕФОН:</p>
              <input style={styles.input} placeholder="050..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <button style={styles.btnPrimary} onClick={() => setStep(2)}>Далі до послуг</button>
            </div>
          ) : (
            <div style={styles.stepContent}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                <p style={styles.label}>ВИБРАНІ ПОСЛУГИ ({selectedServices.length}):</p>
                <button 
                  onClick={() => setShowCatalog(!showCatalog)}
                  style={{background: '#334155', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'}}
                >
                  {showCatalog ? '🔼 Приховати' : '📚 Показати каталог'}
                </button>
              </div>

              {showCatalog && (
                <>
                  <input style={styles.searchInput} placeholder="Пошук послуги..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <div style={styles.serviceList}>
                    {services
                      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(service => {
                        // ПОШУК ЗАЛИШКУ НА СКЛАДІ
                        const stockItem = inventoryItems.find(item => 
                          item.name.toLowerCase() === service.name.toLowerCase()
                        );

                        return (
                          <div 
                            key={service.id} 
                            style={selectedServices.find(s => s.id === service.id) ? styles.serviceItemActive : styles.serviceItem}
                            onClick={() => handleServiceClick(service)}
                          >
                            <div>
                              <span style={styles.serviceCat}>{service.category}</span>
                              <div style={styles.serviceName}>{service.name}</div>
                              {/* Відображення залишку, якщо він є */}
                              {stockItem && (
                                <div style={{fontSize: '11px', color: stockItem.current > 0 ? '#4ADE80' : '#F87171'}}>
                                  Залишок: {stockItem.current} шт.
                                </div>
                              )}
                            </div>
                            <div style={styles.servicePrice}>{service.price} грн</div>
                          </div>
                        );
                    })}
                  </div>
                </>
              )}

              {!showCatalog && selectedServices.length > 0 && (
                <div style={styles.serviceList}>
                   {selectedServices.map(s => (
                     <div key={s.id} style={styles.serviceItemActive} onClick={() => handleServiceClick(s)}>
                        <div style={styles.serviceName}>{s.name}</div>
                        <div style={styles.servicePrice}>{s.price} грн</div>
                     </div>
                   ))}
                </div>
              )}

              <div style={styles.masterSection}>
                <p style={styles.label}>ПРИЗНАЧИТИ МАЙСТРА:</p>
                <select 
                  style={styles.select} 
                  value={formData.masterId} 
                  onChange={e => setFormData({...formData, masterId: e.target.value})}
                >
                  <option value="">Не призначено</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              <div style={styles.urgentRow}>
                <input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} id="urgent" />
                <label htmlFor="urgent" style={styles.urgentLabel}>Терміново (+20%)</label>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div>
            <div style={styles.sumLabel}>СУМА:</div>
            <div style={styles.sumValue}>{totalAmount} грн</div>
          </div>
          <div style={styles.footerBtns}>
            <button style={styles.btnCancel} onClick={onClose}>Скасувати</button>
            <button 
              style={totalAmount > 0 ? styles.btnConfirm : styles.btnDisabled} 
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

const styles = {
  // ... твої стилі залишаються без змін
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: '#1E293B', width: '500px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #334155', color: '#F1F5F9' },
  tabs: { display: 'flex', padding: '20px 20px 0', borderBottom: '1px solid #334155' },
  tab: { padding: '10px 20px', cursor: 'pointer', color: '#94A3B8', fontWeight: 'bold' },
  activeTab: { padding: '10px 20px', cursor: 'pointer', color: '#818CF8', fontWeight: 'bold', borderBottom: '3px solid #818CF8' },
  body: { padding: '20px' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', boxSizing: 'border-box' },
  label: { fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' },
  searchInput: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9', marginBottom: '10px', boxSizing: 'border-box' },
  serviceList: { maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' },
  serviceItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #334155', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', background: '#1E293B' },
  serviceItemActive: { display: 'flex', justifyContent: 'space-between', padding: '12px', border: '2px solid #818CF8', background: '#0F172A', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' },
  serviceCat: { fontSize: '10px', color: '#94A3B8' },
  serviceName: { fontWeight: 'bold', fontSize: '14px' },
  servicePrice: { fontWeight: 'bold' },
  select: { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #334155', background: '#0F172A', color: '#F1F5F9' },
  urgentRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' },
  urgentLabel: { color: '#F1F5F9', fontWeight: 'bold', fontSize: '14px' },
  footer: { padding: '20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { fontSize: '12px', color: '#94A3B8' },
  sumValue: { fontSize: '24px', fontWeight: 'bold', color: '#4ADE80' },
  footerBtns: { display: 'flex', gap: '10px' },
  btnCancel: { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#334155', color: '#F1F5F9', cursor: 'pointer' },
  btnConfirm: { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#818CF8', color: '#F1F5F9', fontWeight: 'bold', cursor: 'pointer' },
  btnDisabled: { padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#334155', color: '#94A3B8' },
  btnPrimary: { width: '100%', padding: '12px', background: '#818CF8', color: '#F1F5F9', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};