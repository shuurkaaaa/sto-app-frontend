import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useInventoryContext } from '../../Context/InventoryContext';
import { validateInventoryItem } from './inventoryValidation';
import { apiClient } from '../../services/apiClient';

export const InventoryAddScreen = ({ onBack, onSave }) => {
  const { categories, addNewItems } = useInventoryContext();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [dbBrands, setDbBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [baseInformation, setBaseInformation] = useState({
    name: '', stockKeepingUnit: '', current: 0, minimum: 2, price: 0,
    category: categories && categories.length > 1 ? categories[1].name : (categories[0]?.name || ''),
  });

  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [compatibilityList, setCompatibilityList] = useState([]);

  useEffect(() => {
    apiClient.get('/cars/brands').then(r => setDbBrands(r.data)).catch(() => {});
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const updateSpec = (i, field, value) => {
    const arr = [...specs]; arr[i][field] = value; setSpecs(arr);
  };
  const removeSpecField = (i) => setSpecs(specs.filter((_, idx) => idx !== i));

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

  const removeCompatibility = (i) => setCompatibilityList(compatibilityList.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const validationErrors = validateInventoryItem(baseInformation);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const categoryObj = categories.find(c => c.name === baseInformation.category);
    const filteredSpecs = specs
      .filter(s => s.key.trim() && s.value.trim())
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
      if (selectedFile) formData.append('image', selectedFile);

      await addNewItems(formData);
      if (onSave) await onSave();
      onBack();
    } catch (err) {
      console.error('Помилка збереження:', err);
      alert('Не вдалося зберегти товар.');
    }
  };

  const currentModels = dbBrands.find(b => b.id === parseInt(selectedBrandId))?.models || [];

  return ReactDOM.createPortal(
    <div className="sto-modal-overlay">
      <div className="sto-modal sto-modal-md">
        <h2 className="text-light mb-4" style={{ fontSize: '24px' }}>Прийом товару</h2>

        <div className="d-flex gap-4 mb-3">
          <div className="text-center">
            <div
              className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center"
              style={{ width: '160px', height: '160px', border: '2px dashed var(--sto-border)', background: 'var(--sto-bg)', cursor: 'pointer' }}
              onClick={() => document.getElementById('imageUpload').click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="sto-text-muted small">📸 Фото</div>
              )}
            </div>
            <input id="imageUpload" type="file" accept="image/*" onChange={handlePhotoChange} className="d-none" />
          </div>

          <div className="flex-grow-1">
            <label className="sto-label">Категорія *</label>
            <select
              className="sto-select"
              value={baseInformation.category}
              onChange={e => setBaseInformation({ ...baseInformation, category: e.target.value })}
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <div className="mt-3">
              <label className="sto-label">Кількість (шт)</label>
              <input
                className="sto-input"
                type="number"
                value={baseInformation.current}
                onChange={e => setBaseInformation({ ...baseInformation, current: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">Назва запчастини *</label>
          <input
            className={`sto-input ${errors.name ? 'sto-input--error' : ''}`}
            value={baseInformation.name}
            onChange={e => setBaseInformation({ ...baseInformation, name: e.target.value })}
          />
        </div>

        <div className="d-flex gap-3 mb-3">
          <div className="flex-grow-1">
            <label className="sto-label">SKU</label>
            <input
              className="sto-input"
              value={baseInformation.stockKeepingUnit}
              onChange={e => setBaseInformation({ ...baseInformation, stockKeepingUnit: e.target.value })}
            />
          </div>
          <div className="flex-grow-1">
            <label className="sto-label">Ціна (грн)</label>
            <input
              className="sto-input"
              type="number"
              value={baseInformation.price}
              onChange={e => setBaseInformation({ ...baseInformation, price: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-3 p-3 mb-3 overflow-auto" style={{ background: 'var(--sto-bg-2)', border: '1px solid var(--sto-border)', maxHeight: '150px' }}>
          <label className="sto-label sto-text-accent">Технічні дані</label>
          {specs.map((spec, i) => (
            <div key={i} className="d-flex gap-2 mb-2">
              <input className="sto-input" placeholder="Параметр" value={spec.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} />
              <input className="sto-input" placeholder="Значення" value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpecField(i)} className="border-0 sto-text-danger" style={{ background: 'none', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addSpecField} className="sto-btn-dashed">+ Додати</button>
        </div>

        <div className="sto-form-group pt-3" style={{ borderTop: '1px solid var(--sto-border)' }}>
          <label className="sto-label">Сумісність</label>
          <div className="d-flex gap-2 mb-2">
            <select className="sto-select" value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)}>
              <option value="">Марка</option>
              {dbBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="sto-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={!selectedBrandId}>
              <option value="">Модель</option>
              {currentModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <button type="button" onClick={handleAddCompatibility} className="sto-btn sto-btn-primary">+</button>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {compatibilityList.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2 px-2 py-1 d-flex align-items-center gap-2 border sto-text-accent"
                style={{ background: 'var(--sto-bg-2)', borderColor: 'var(--sto-border)', fontSize: '12px' }}
              >
                {item}
                <span onClick={() => removeCompatibility(idx)} className="sto-text-danger" style={{ cursor: 'pointer' }}>✕</span>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-3">
          <button type="button" onClick={onBack} className="sto-btn sto-btn-secondary flex-grow-1">Скасувати</button>
          <button type="button" onClick={handleSave} className="sto-btn sto-btn-primary" style={{ flex: 2 }}>Зберегти</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
