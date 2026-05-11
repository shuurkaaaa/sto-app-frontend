import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useInventoryContext } from '../../Context/InventoryContext';
import { apiClient } from '../../services/apiClient';

export const EditItemModal = ({ inventoryItem, onClose, onSave }) => {
  const { categories, updateItem } = useInventoryContext();

  const [formData, setFormData] = useState({
    id: '', name: '', stockKeepingUnit: '', price: 0, current: 0, minimum: 2,
    compatibility: '', categoryId: '', technicalData: [{ parameter: '', value: '' }],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');

  useEffect(() => {
    apiClient.get('/cars/brands').then(r => setBrands(r.data)).catch(() => {});

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
        technicalData: inventoryItem.technicalData?.length
          ? inventoryItem.technicalData.map(s => ({ parameter: s.parameter, value: s.value }))
          : [{ parameter: '', value: '' }],
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
      [name]: ['price', 'current', 'minimum'].includes(name) ? (parseFloat(value) || 0) : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleAddCompatibility = () => {
    if (!selectedBrandName || !selectedModelName) return;
    const newEntry = `${selectedBrandName} ${selectedModelName}`;
    const cur = (formData.compatibility || '').toString().trim();
    setFormData(p => ({ ...p, compatibility: cur ? `${cur}, ${newEntry}` : newEntry }));
    setSelectedBrandName(''); setSelectedModelName('');
  };

  const handleTechChange = (i, field, value) => {
    const arr = [...formData.technicalData];
    arr[i][field] = value;
    setFormData(p => ({ ...p, technicalData: arr }));
  };
  const addTechField = () => setFormData(p => ({ ...p, technicalData: [...p.technicalData, { parameter: '', value: '' }] }));
  const removeTechField = (i) => {
    const arr = formData.technicalData.filter((_, idx) => idx !== i);
    setFormData(p => ({ ...p, technicalData: arr.length ? arr : [{ parameter: '', value: '' }] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalId = formData.id || inventoryItem?.id;
    if (!finalId) { alert('Не вдалося знайти ID товару.'); return; }

    const filteredSpecs = formData.technicalData.filter(s => s.parameter.trim() && s.value.trim());
    const data = new FormData();
    data.append('name', formData.name || '');
    data.append('stockKeepingUnit', formData.stockKeepingUnit || '');
    data.append('price', String(formData.price || 0));
    data.append('current', String(formData.current || 0));
    data.append('minimum', String(formData.minimum || 0));
    data.append('compatibility', formData.compatibility || '');
    if (formData.categoryId) data.append('categoryId', String(formData.categoryId));
    data.append('technicalData', JSON.stringify(filteredSpecs));
    if (selectedFile) data.append('image', selectedFile);

    try {
      await updateItem(finalId, data);
      if (onSave) await onSave();
      onClose();
    } catch { alert('Не вдалося оновити товар.'); }
  };

  if (!inventoryItem) return null;
  const availableModels = brands.find(b => b.name === selectedBrandName)?.models || [];

  return ReactDOM.createPortal(
    <div className="sto-modal-overlay">
      <div className="sto-modal sto-modal-lg" style={{ maxWidth: '750px', width: '90%' }}>
        <h2 className="text-light mb-4" style={{ fontSize: '22px' }}>Редагування товару</h2>

        <div className="d-flex gap-4 mb-3">
          <div className="text-center">
            <div
              className="rounded-3 overflow-hidden d-flex align-items-center justify-content-center"
              style={{
                width: '140px', height: '140px',
                border: '2px dashed #475569',
                background: 'var(--sto-bg)', cursor: 'pointer',
              }}
              onClick={() => document.getElementById('editImageUpload').click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="sto-text-muted small p-2">📸 Фото</div>
              )}
            </div>
            <input id="editImageUpload" type="file" className="d-none" onChange={handlePhotoChange} accept="image/*" />
          </div>

          <div className="flex-grow-1">
            <div className="sto-form-group">
              <label className="sto-label">НАЗВА ЗАПЧАСТИНИ *</label>
              <input name="name" className="sto-input" value={formData.name} onChange={handleChange} />
            </div>
            <div className="d-flex gap-3">
              <div className="flex-grow-1">
                <label className="sto-label">SKU / АРТИКУЛ</label>
                <input name="stockKeepingUnit" className="sto-input" value={formData.stockKeepingUnit} onChange={handleChange} />
              </div>
              <div className="flex-grow-1">
                <label className="sto-label">ЦІНА (ГРН)</label>
                <input name="price" type="number" className="sto-input" value={formData.price} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">КАТЕГОРІЯ</label>
          <select name="categoryId" className="sto-select" value={formData.categoryId} onChange={handleChange}>
            <option value="">Без категорії</option>
            {categories.filter(c => c.id !== 'all').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="rounded-3 p-3 mb-3 border" style={{ background: 'rgba(30,41,59,0.3)', borderColor: 'var(--sto-border)' }}>
          <label className="sto-label sto-text-accent mb-2">ТЕХНІЧНІ ХАРАКТЕРИСТИКИ</label>
          <div className="overflow-auto" style={{ maxHeight: '150px' }}>
            {formData.technicalData.map((tech, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <input className="sto-input" placeholder="Параметр" value={tech.parameter} onChange={(e) => handleTechChange(i, 'parameter', e.target.value)} />
                <input className="sto-input" placeholder="Значення" value={tech.value} onChange={(e) => handleTechChange(i, 'value', e.target.value)} />
                <button type="button" onClick={() => removeTechField(i)} className="border-0 sto-text-danger" style={{ background: 'none', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTechField} className="sto-btn-dashed">+ Додати параметр</button>
        </div>

        <div className="sto-form-group">
          <label className="sto-label">СУМІСНІСТЬ</label>
          <input name="compatibility" className="sto-input mb-2" value={formData.compatibility} onChange={handleChange} />
          <div className="d-flex gap-2">
            <select className="sto-select" value={selectedBrandName} onChange={(e) => setSelectedBrandName(e.target.value)}>
              <option value="">Марка</option>
              {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            <select className="sto-select" value={selectedModelName} onChange={(e) => setSelectedModelName(e.target.value)} disabled={!selectedBrandName}>
              <option value="">Модель</option>
              {availableModels.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <button type="button" onClick={handleAddCompatibility} className="sto-btn sto-btn-primary">Додати</button>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3 mt-3">
          <button type="button" onClick={onClose} className="sto-btn sto-btn-secondary">Скасувати</button>
          <button type="button" onClick={handleSubmit} className="sto-btn sto-btn-primary">Зберегти зміни</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
