import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { inventoryStyles } from './InventoryStyles';
import { useInventoryContext } from '../../Context/InventoryContext';

export const EditItemModal = ({ inventoryItem, onClose, onSave }) => {
  const { categories, updateItem } = useInventoryContext();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    stockKeepingUnit: '',
    price: 0,
    current: 0,
    minimum: 2,
    compatibility: '',
    categoryId: '',
    technicalData: [{ parameter: '', value: '' }]
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars/brands');
        setBrands(response.data);
      } catch (error) {
        console.error("Помилка завантаження авто-даних:", error);
      }
    };
    fetchCarData();

    if (inventoryItem) {
      setFormData({
        id: inventoryItem.id || inventoryItem._id || '',
        name: inventoryItem.name || '',
        stockKeepingUnit: inventoryItem.stockKeepingUnit || '',
        price: inventoryItem.price || 0,
        current: inventoryItem.current || 0,
        minimum: inventoryItem.minimum || 2,
        compatibility: inventoryItem.compatibility || '',
        categoryId: inventoryItem.categoryId || (inventoryItem.category?.id || ''),
        technicalData: inventoryItem.technicalData && inventoryItem.technicalData.length > 0 
          ? inventoryItem.technicalData.map(s => ({ parameter: s.parameter, value: s.value }))
          : [{ parameter: '', value: '' }]
      });
      
      if (inventoryItem.imageSource) {
        setPreviewUrl(`http://localhost:5000${inventoryItem.imageSource}`);
      }
    }
  }, [inventoryItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'current' || name === 'minimum') ? (parseFloat(value) || 0) : value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddCompatibility = () => {
    if (!selectedBrandName || !selectedModelName) return;
    const newEntry = `${selectedBrandName} ${selectedModelName}`;
    const currentVal = (formData.compatibility || "").toString().trim();
    setFormData(prev => ({
      ...prev,
      compatibility: currentVal ? `${currentVal}, ${newEntry}` : newEntry
    }));
    setSelectedBrandName('');
    setSelectedModelName('');
  };

  const handleTechChange = (index, field, value) => {
    const newTechData = [...formData.technicalData];
    newTechData[index][field] = value;
    setFormData(prev => ({ ...prev, technicalData: newTechData }));
  };

  const addTechField = () => {
    setFormData(prev => ({
      ...prev,
      technicalData: [...prev.technicalData, { parameter: '', value: '' }]
    }));
  };

  const removeTechField = (index) => {
    const newTechData = formData.technicalData.filter((_, i) => i !== index);
    setFormData(prev => ({ 
      ...prev, 
      technicalData: newTechData.length > 0 ? newTechData : [{ parameter: '', value: '' }] 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalId = formData.id || inventoryItem?.id;
    if (!finalId) {
      alert("Не вдалося знайти ID товару.");
      return;
    }

    const filteredSpecs = formData.technicalData.filter(s => s.parameter.trim() && s.value.trim());
    
    const data = new FormData();
    data.append('name', formData.name || "");
    data.append('stockKeepingUnit', formData.stockKeepingUnit || "");
    data.append('price', String(formData.price || 0));
    data.append('current', String(formData.current || 0));
    data.append('minimum', String(formData.minimum || 0));
    data.append('compatibility', formData.compatibility || "");
    
    if (formData.categoryId) {
      data.append('categoryId', String(formData.categoryId));
    }
    
    data.append('technicalData', JSON.stringify(filteredSpecs));
    
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    try {
      await updateItem(finalId, data);
      if (onSave) await onSave(); 
      onClose();
    } catch (err) {
      console.error("Помилка збереження змін:", err);
      alert("Не вдалося оновити товар.");
    }
  };

  if (!inventoryItem) return null;

  const availableModels = brands.find(b => b.name === selectedBrandName)?.models || [];

  return ReactDOM.createPortal(
    <div style={inventoryStyles.modalOverlay}>
      <div style={{ ...inventoryStyles.modalContent, maxWidth: '750px', width: '90%' }}>
        <h2 style={{ marginBottom: '24px', color: '#F1F5F9', fontSize: '22px' }}>Редагування товару</h2>
        
        <div style={{ display: 'flex', gap: '25px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: '140px', height: '140px', border: '2px dashed #475569', 
                borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0F172A'
              }}
              onClick={() => document.getElementById('editImageUpload').click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '12px', padding: '10px' }}>📸 Фото</div>
              )}
            </div>
            <input id="editImageUpload" type="file" style={{ display: 'none' }} onChange={handlePhotoChange} accept="image/*" />
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={inventoryStyles.modalLabel}>НАЗВА ЗАПЧАСТИНИ *</label>
              <input name="name" style={inventoryStyles.modalInput} value={formData.name} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={inventoryStyles.modalLabel}>SKU / АРТИКУЛ</label>
                <input name="stockKeepingUnit" style={inventoryStyles.modalInput} value={formData.stockKeepingUnit} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={inventoryStyles.modalLabel}>ЦІНА (ГРН)</label>
                <input name="price" type="number" style={inventoryStyles.modalInput} value={formData.price} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={inventoryStyles.modalLabel}>КАТЕГОРІЯ</label>
          <select name="categoryId" style={inventoryStyles.modalInput} value={formData.categoryId} onChange={handleChange}>
            <option value="">Без категорії</option>
            {categories.filter(c => c.id !== 'all').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '20px', backgroundColor: 'rgba(30, 41, 59, 0.3)' }}>
          <label style={{ ...inventoryStyles.modalLabel, color: '#818CF8', marginBottom: '12px' }}>ТЕХНІЧНІ ХАРАКТЕРИСТИКИ</label>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {formData.technicalData.map((tech, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <input style={{ ...inventoryStyles.modalInput, flex: 1 }} placeholder="Параметр" value={tech.parameter} onChange={(e) => handleTechChange(index, 'parameter', e.target.value)} />
                <input style={{ ...inventoryStyles.modalInput, flex: 1 }} placeholder="Значення" value={tech.value} onChange={(e) => handleTechChange(index, 'value', e.target.value)} />
                <button type="button" onClick={() => removeTechField(index)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTechField} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #475569', color: '#94A3B8', cursor: 'pointer' }}>+ Додати параметр</button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={inventoryStyles.modalLabel}>СУМІСНІСТЬ</label>
          <input name="compatibility" style={{ ...inventoryStyles.modalInput, marginBottom: '12px' }} value={formData.compatibility} onChange={handleChange} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select style={{ ...inventoryStyles.modalInput, flex: 1 }} value={selectedBrandName} onChange={(e) => setSelectedBrandName(e.target.value)}>
              <option value="">Марка</option>
              {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            <select style={{ ...inventoryStyles.modalInput, flex: 1 }} value={selectedModelName} onChange={(e) => setSelectedModelName(e.target.value)} disabled={!selectedBrandName}>
              <option value="">Модель</option>
              {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <button type="button" onClick={handleAddCompatibility} style={{ ...inventoryStyles.mainAddButton, padding: '0 20px', height: '42px' }}>Додати</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <button type="button" onClick={onClose} style={inventoryStyles.purchaseButton}>Скасувати</button>
          <button type="button" onClick={handleSubmit} style={inventoryStyles.mainAddButton}>Зберегти зміни</button>
        </div>
      </div>
    </div>,
    document.body
  );
};