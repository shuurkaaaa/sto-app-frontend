import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/apiClient';

export const CarManagerModal = ({ onClose }) => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const API_URL = '/cars';

  const fetchBrands = useCallback(async () => {
    try {
      const response = await apiClient.get(`${API_URL}/brands`);
      const data = response.data;
      setBrands(data);
      setSelectedBrand(prev => {
        if (!prev) return null;
        return data.find(b => b.id === prev.id) || null;
      });
    } catch (error) {
      console.error('Помилка при завантаженні марок авто:', error);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      await apiClient.post(`${API_URL}/brands`, { name: newBrandName });
      setNewBrandName('');
      await fetchBrands();
    } catch { alert('Не вдалося додати марку.'); }
  };

  const handleUpdateBrand = async (id) => {
    if (!editValue.trim()) { setEditingId(null); return; }
    try {
      await apiClient.put(`${API_URL}/brands/${id}`, { name: editValue });
      setEditingId(null);
      await fetchBrands();
    } catch (e) { console.error(e); }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Увага! Видалення марки призведе до видалення всіх моделей. Продовжити?')) return;
    try {
      await apiClient.delete(`${API_URL}/brands/${id}`);
      if (selectedBrand?.id === id) setSelectedBrand(null);
      await fetchBrands();
    } catch (e) { console.error(e); }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim() || !selectedBrand) return;
    try {
      await apiClient.post(`${API_URL}/models`, { name: newModelName, brandId: selectedBrand.id });
      setNewModelName('');
      await fetchBrands();
    } catch (e) { console.error(e); }
  };

  const handleUpdateModel = async (id) => {
    if (!editValue.trim()) { setEditingId(null); return; }
    try {
      await apiClient.put(`${API_URL}/models/${id}`, { name: editValue });
      setEditingId(null);
      await fetchBrands();
    } catch (e) { console.error(e); }
  };

  const handleDeleteModel = async (id) => {
    try {
      await apiClient.delete(`${API_URL}/models/${id}`);
      await fetchBrands();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="sto-modal-overlay">
      <div className="sto-modal" style={{ width: '850px', maxWidth: '95%' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0 text-light fw-semibold" style={{ fontSize: '22px' }}>Керування базою автомобілів</h2>
          <button onClick={onClose} className="sto-text-muted border-0" style={{ background: 'none', fontSize: '32px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div className="d-flex gap-4" style={{ height: '550px' }}>
          <div className="flex-grow-1 d-flex flex-column pe-3" style={{ flex: 1, borderRight: '1px solid var(--sto-border)' }}>
            <label className="sto-label">МАРКИ ТА БРЕНДИ</label>

            <div className="d-flex gap-2 mb-3">
              <input
                className="sto-input"
                placeholder="Додати нову марку..."
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
              />
              <button onClick={handleAddBrand} className="sto-btn sto-btn-primary">+</button>
            </div>

            <div className="overflow-auto flex-grow-1">
              {brands.map(brand => (
                <div
                  key={brand.id}
                  className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 border"
                  style={{
                    background: selectedBrand?.id === brand.id ? 'var(--sto-bg-2)' : 'transparent',
                    borderColor: selectedBrand?.id === brand.id ? '#818CF8' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <div className="flex-grow-1 d-flex align-items-center">
                    {editingId === `brand-${brand.id}` ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleUpdateBrand(brand.id)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdateBrand(brand.id)}
                        onClick={e => e.stopPropagation()}
                        className="sto-input"
                      />
                    ) : (
                      <span className={selectedBrand?.id === brand.id ? 'sto-text-accent fw-semibold' : 'text-light'}>
                        {brand.name}
                      </span>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(`brand-${brand.id}`); setEditValue(brand.name); }}
                      className="sto-btn-edit-sm"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id); }}
                      className="sto-btn-delete-sm"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex flex-column" style={{ flex: 1.4 }}>
            <label className="sto-label">
              {selectedBrand ? `МОДЕЛІ ${selectedBrand.name.toUpperCase()}` : 'КЕРУВАННЯ МОДЕЛЯМИ'}
            </label>

            {selectedBrand ? (
              <>
                <div className="d-flex gap-2 mb-3">
                  <input
                    className="sto-input"
                    placeholder={`Додати модель для ${selectedBrand.name}...`}
                    value={newModelName}
                    onChange={e => setNewModelName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddModel()}
                  />
                  <button onClick={handleAddModel} className="sto-btn sto-btn-primary">+</button>
                </div>

                <div className="overflow-auto" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignContent: 'start' }}>
                  {selectedBrand.models?.map(model => (
                    <div
                      key={model.id}
                      className="p-2 rounded-3 d-flex justify-content-between align-items-center"
                      style={{ background: 'var(--sto-bg)', border: '1px solid var(--sto-bg-2)' }}
                    >
                      <div className="flex-grow-1">
                        {editingId === `model-${model.id}` ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleUpdateModel(model.id)}
                            onKeyDown={e => e.key === 'Enter' && handleUpdateModel(model.id)}
                            className="sto-input"
                          />
                        ) : (
                          <span className="sto-text-muted">{model.name}</span>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <button onClick={() => { setEditingId(`model-${model.id}`); setEditValue(model.name); }} className="sto-btn-edit-sm">✎</button>
                        <button onClick={() => handleDeleteModel(model.id)} className="sto-btn-delete-sm">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                className="flex-grow-1 d-flex align-items-center justify-content-center text-center rounded-3 p-3 sto-text-dim"
                style={{ border: '2px dashed var(--sto-bg-2)', lineHeight: '1.6' }}
              >
                Будь ласка, виберіть марку автомобіля зі списку ліворуч.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
