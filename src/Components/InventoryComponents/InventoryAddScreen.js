import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { inventoryStyles } from './InventoryStyles';
import { useInventoryContext } from '../../Context/InventoryContext';
import { validateInventoryItem } from './inventoryValidation';

export const InventoryAddScreen = ({ onBack, onSave }) => {
  // Беремо addNewItems напряму з контексту
  const { categories, addNewItems } = useInventoryContext();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [dbBrands, setDbBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [baseInformation, setBaseInformation] = useState({ 
    name: '', 
    stockKeepingUnit: '', 
    current: 0, 
    minimum: 2, 
    price: 0,
    category: categories && categories.length > 1 ? categories[1].name : (categories[0]?.name || '')
  });

  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [compatibilityList, setCompatibilityList] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cars/brands');
        setDbBrands(response.data);
      } catch (err) {
        console.error("Помилка завантаження марок:", err);
      }
    };
    loadBrands();
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  
  const updateSpec = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const removeSpecField = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddCompatibility = () => {
    const brand = dbBrands.find(b => b.id === parseInt(selectedBrandId));
    if (brand && selectedModel) {
      const entry = `${brand.name} ${selectedModel}`;
      if (!compatibilityList.includes(entry)) {
        setCompatibilityList(prev => [...prev, entry]);
      }
      setSelectedModel('');
    }
  };

  const removeCompatibility = (index) => {
    setCompatibilityList(compatibilityList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const validationErrors = validateInventoryItem(baseInformation);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const categoryObj = categories.find(c => c.name === baseInformation.category);
    const filteredSpecs = specs
      .filter(s => s.key.trim() !== '' && s.value.trim() !== '')
      .map(s => ({ parameter: s.key, value: s.value }));

    try {
      const formData = new FormData();
      formData.append('name', baseInformation.name);
      formData.append('stockKeepingUnit', baseInformation.stockKeepingUnit);
      formData.append('current', baseInformation.current);
      formData.append('minimum', baseInformation.minimum);
      formData.append('price', baseInformation.price);
      formData.append('categoryId', categoryObj ? categoryObj.id : '');
      formData.append('specifications', JSON.stringify(filteredSpecs));
      formData.append('compatibility', compatibilityList.join(', '));
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      // Викликаємо функцію з контексту
      await addNewItems(formData);
      
      if (onSave) await onSave(); 
      onBack(); 
    } catch (err) {
      console.error("Помилка збереження:", err);
      alert("Не вдалося зберегти товар. Перевір підключення до сервера.");
    }
  };

  const currentModels = dbBrands.find(b => b.id === parseInt(selectedBrandId))?.models || [];

  return ReactDOM.createPortal(
    <div style={inventoryStyles.modalOverlay}>
      <div style={inventoryStyles.modalContent}>
        <h2 style={{ color: '#F1F5F9', marginBottom: '25px', fontSize: '24px' }}>Прийом товару</h2>

        <div style={{ display: 'flex', gap: '25px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{
                width: '160px', height: '160px', border: '2px dashed #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#0F172A', cursor: 'pointer', borderRadius: '15px',
                overflow: 'hidden'
              }}
              onClick={() => document.getElementById('imageUpload').click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#94A3B8', fontSize: '12px' }}>📸 Фото</div>
              )}
            </div>
            <input id="imageUpload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1 }}>
            <label style={inventoryStyles.modalLabel}>Категорія *</label>
            <select 
              style={inventoryStyles.modalInput} 
              value={baseInformation.category} 
              onChange={(e) => setBaseInformation({...baseInformation, category: e.target.value})}
            >
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <div style={{ marginTop: '15px' }}>
              <label style={inventoryStyles.modalLabel}>Кількість (шт)</label>
              <input 
                style={inventoryStyles.modalInput} 
                type="number"
                value={baseInformation.current}
                onChange={e => setBaseInformation({...baseInformation, current: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={inventoryStyles.modalLabel}>Назва запчастини *</label>
          <input 
            style={{ ...inventoryStyles.modalInput, borderColor: errors.name ? '#EF4444' : '#334155' }} 
            value={baseInformation.name}
            onChange={e => setBaseInformation({...baseInformation, name: e.target.value})} 
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={inventoryStyles.modalLabel}>SKU</label>
            <input 
              style={inventoryStyles.modalInput} 
              value={baseInformation.stockKeepingUnit}
              onChange={e => setBaseInformation({...baseInformation, stockKeepingUnit: e.target.value})} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={inventoryStyles.modalLabel}>Ціна (грн)</label>
            <input 
              style={inventoryStyles.modalInput} 
              type="number" 
              value={baseInformation.price}
              onChange={e => setBaseInformation({...baseInformation, price: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ backgroundColor: '#1E293B', padding: '15px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', maxHeight: '150px', overflowY: 'auto' }}>
          <label style={{ ...inventoryStyles.modalLabel, color: '#818CF8' }}>Технічні дані</label>
          {specs.map((spec, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                style={{ ...inventoryStyles.modalInput, marginBottom: 0 }} 
                placeholder="Параметр" 
                value={spec.key} 
                onChange={(e) => updateSpec(index, 'key', e.target.value)} 
              />
              <input 
                style={{ ...inventoryStyles.modalInput, marginBottom: 0 }} 
                placeholder="Значення" 
                value={spec.value} 
                onChange={(e) => updateSpec(index, 'value', e.target.value)} 
              />
              <button type="button" onClick={() => removeSpecField(index)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addSpecField} style={{ background: 'none', border: '1px dashed #475569', color: '#94A3B8', padding: '8px', width: '100%', borderRadius: '8px', cursor: 'pointer' }}>+ Додати</button>
        </div>

        <div style={{ marginBottom: '20px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <label style={inventoryStyles.modalLabel}>Сумісність</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select style={{ ...inventoryStyles.modalInput, flex: 1 }} value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}>
              <option value="">Марка</option>
              {dbBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select style={{ ...inventoryStyles.modalInput, flex: 1 }} value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedBrandId}>
              <option value="">Модель</option>
              {currentModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <button type="button" onClick={handleAddCompatibility} style={{ ...inventoryStyles.mainAddButton, padding: '0 15px', height: '40px' }}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {compatibilityList.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#1E293B', color: '#818CF8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item} <span onClick={() => removeCompatibility(idx)} style={{ cursor: 'pointer', color: '#EF4444' }}>✕</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="button" onClick={onBack} style={{ ...inventoryStyles.purchaseButton, flex: 1 }}>Скасувати</button>
          <button type="button" onClick={handleSave} style={{ ...inventoryStyles.mainAddButton, flex: 2 }}>Зберегти</button>
        </div>
      </div>
    </div>,
    document.body
  );
};