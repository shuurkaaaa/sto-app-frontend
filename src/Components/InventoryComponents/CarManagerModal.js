import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { inventoryStyles } from './InventoryStyles';

export const CarManagerModal = ({ onClose }) => {
  // Основні стейти для даних
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Стейти для створення нових записів
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  
  // Стейти для режиму редагування існуючих записів
  const [editingId, setEditingId] = useState(null); 
  const [editValue, setEditValue] = useState('');

  const API_URL = 'http://localhost:5000/api/cars';

  // Функція завантаження даних
  // МАСИВ ЗАЛЕЖНОСТЕЙ ПОРОЖНІЙ [], щоб уникнути нескінченного циклу
  const fetchBrands = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/brands`);
      const data = response.data;
      setBrands(data);
      
      // Використовуємо функціональне оновлення (prevSelected), 
      // щоб не залежати від зовнішньої змінної selectedBrand
      setSelectedBrand(prevSelected => {
        if (!prevSelected) return null;
        const updatedSelected = data.find(b => b.id === prevSelected.id);
        return updatedSelected || null;
      });
    } catch (error) {
      console.error("Помилка при завантаженні марок авто:", error);
    }
  }, []); 

  // Завантажуємо при першому відкритті модалки
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // --- ЛОГІКА ДЛЯ БРЕНДІВ (МАРКИ) ---

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      await axios.post(`${API_URL}/brands`, { name: newBrandName });
      setNewBrandName('');
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при додаванні марки:", error);
      alert("Не вдалося додати марку. Можливо, вона вже існує.");
    }
  };

  const handleUpdateBrand = async (id) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/brands/${id}`, { name: editValue });
      setEditingId(null);
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при оновленні марки:", error);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Увага! Видалення марки призведе до видалення всіх її моделей. Продовжити?")) return;
    try {
      await axios.delete(`${API_URL}/brands/${id}`);
      if (selectedBrand?.id === id) setSelectedBrand(null);
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при видаленні марки:", error);
    }
  };

  // --- ЛОГІКА ДЛЯ МОДЕЛЕЙ ---

  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedBrand) return;
    try {
      await axios.post(`${API_URL}/models`, { 
        name: newModelName, 
        brandId: selectedBrand.id 
      });
      setNewModelName('');
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при додаванні моделі:", error);
    }
  };

  const handleUpdateModel = async (id) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await axios.put(`${API_URL}/models/${id}`, { name: editValue });
      setEditingId(null);
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при оновленні моделі:", error);
    }
  };

  const handleDeleteModel = async (id) => {
    try {
      await axios.delete(`${API_URL}/models/${id}`);
      await fetchBrands();
    } catch (error) {
      console.error("Помилка при видаленні моделі:", error);
    }
  };

  return (
    <div style={inventoryStyles.modalOverlay}>
      <div style={{ ...inventoryStyles.modalContent, width: '850px', maxWidth: '95%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#F1F5F9', margin: 0, fontSize: '22px', fontWeight: '600' }}>Керування базою автомобілів</h2>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '32px', lineHeight: '1' }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', gap: '30px', height: '550px' }}>
          
          <div style={{ flex: 1, borderRight: '1px solid #334155', paddingRight: '20px', display: 'flex', flexDirection: 'column' }}>
            <label style={inventoryStyles.modalLabel}>МАРКИ ТА БРЕНДИ</label>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                style={inventoryStyles.modalInput} 
                placeholder="Додати нову марку..." 
                value={newBrandName} 
                onChange={e => setNewBrandName(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
              />
              <button onClick={handleAddBrand} style={inventoryStyles.mainAddButton}>+</button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
              {brands.map(brand => (
                <div 
                  key={brand.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', marginBottom: '8px', borderRadius: '10px',
                    backgroundColor: selectedBrand?.id === brand.id ? '#1E293B' : 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid',
                    borderColor: selectedBrand?.id === brand.id ? '#818CF8' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {editingId === `brand-${brand.id}` ? (
                      <input 
                        autoFocus 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleUpdateBrand(brand.id)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdateBrand(brand.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ ...inventoryStyles.modalInput, height: '28px', margin: 0, fontSize: '14px' }}
                      />
                    ) : (
                      <span style={{ 
                        color: selectedBrand?.id === brand.id ? '#818CF8' : '#F1F5F9', 
                        fontWeight: selectedBrand?.id === brand.id ? '600' : '400',
                        fontSize: '15px'
                      }}>
                        {brand.name}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setEditingId(`brand-${brand.id}`); 
                        setEditValue(brand.name); 
                      }} 
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                    >
                      ✎
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBrand(brand.id);
                      }} 
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column' }}>
            <label style={inventoryStyles.modalLabel}>
              {selectedBrand ? `МОДЕЛІ ${selectedBrand.name.toUpperCase()}` : 'КЕРУВАННЯ МОДЕЛЯМИ'}
            </label>
            
            {selectedBrand ? (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input 
                    style={inventoryStyles.modalInput} 
                    placeholder={`Додати модель для ${selectedBrand.name}...`} 
                    value={newModelName} 
                    onChange={e => setNewModelName(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleAddModel()}
                  />
                  <button onClick={handleAddModel} style={inventoryStyles.mainAddButton}>+</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', overflowY: 'auto', alignContent: 'start', paddingRight: '5px' }}>
                  {selectedBrand.models?.map(model => (
                    <div 
                      key={model.id}
                      style={{
                        padding: '12px', backgroundColor: '#0F172A', borderRadius: '10px',
                        border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {editingId === `model-${model.id}` ? (
                          <input 
                            autoFocus 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleUpdateModel(model.id)}
                            onKeyDown={e => e.key === 'Enter' && handleUpdateModel(model.id)}
                            style={{ ...inventoryStyles.modalInput, height: '28px', margin: 0, fontSize: '13px' }}
                          />
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '14px' }}>{model.name}</span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                        <button 
                          onClick={() => { setEditingId(`model-${model.id}`); setEditValue(model.name); }} 
                          style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px' }}
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => handleDeleteModel(model.id)} 
                          style={{ background: 'none', border: 'none', color: '#7F1D1D', cursor: 'pointer', fontSize: '14px' }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ 
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#475569', textAlign: 'center', border: '2px dashed #1E293B', borderRadius: '15px',
                padding: '20px', lineHeight: '1.6'
              }}>
                Будь ласка, виберіть марку автомобіля зі списку ліворуч.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};