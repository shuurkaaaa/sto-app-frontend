import React from 'react';

export const OrderStep2 = ({
  services, selectedServices, handleServiceClick,
  masters, formData, setFormData, isUrgent, setIsUrgent,
  searchTerm, setSearchTerm, setIsPickerOpen,
}) => {
  const filteredServices = (services || []).filter(s => {
    const searchLower = (searchTerm || '').toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(searchLower);
    const catName = s.priceCategory?.name || s.categoryName || s.category || '';
    const categoryMatch = catName.toLowerCase().includes(searchLower);
    return nameMatch || categoryMatch;
  });

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <p className="sto-label">ВИБЕРІТЬ ПОСЛУГИ З ПРАЙСУ:</p>
        <div className="d-flex gap-2 mb-2">
          <input
            className="sto-input flex-grow-1"
            placeholder="Пошук (назва або категорія)..."
            value={searchTerm || ''}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="sto-btn sto-btn-secondary text-nowrap"
          >
            Каталог
          </button>
        </div>

        <div
          className="rounded-3 p-2 border"
          style={{ height: '180px', overflowY: 'auto', background: 'var(--sto-bg)', borderColor: 'var(--sto-border)' }}
        >
          {filteredServices.length > 0 ? (
            filteredServices.map(s => {
              const isSelected = selectedServices.some(i => i.id === s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => handleServiceClick(s)}
                  className="p-2 mb-2 rounded-2 d-flex justify-content-between align-items-center"
                  style={{
                    cursor: 'pointer',
                    border: '1px solid',
                    background: isSelected ? '#1e3a8a' : 'var(--sto-bg-2)',
                    borderColor: isSelected ? '#3b82f6' : 'var(--sto-border)',
                    color: isSelected ? '#fff' : '#cbd5e1',
                  }}
                >
                  <div className="flex-grow-1 me-2">
                    <span className="sto-text-muted d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                      {s.priceCategory?.name || s.categoryName || s.category || 'Загальне'}
                    </span>
                    <span className="fw-medium">{s.name}</span>
                  </div>
                  <div className="text-end">
                    <span className="sto-text-success fw-bold d-block">{s.price} грн</span>
                    {isSelected && <span style={{ fontSize: '12px' }}></span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center sto-text-dim mt-5">Послуг не знайдено</div>
          )}
        </div>
      </div>

      <div>
        <p className="sto-label">ПРИЗНАЧИТИ МАЙСТРА:</p>
        <select
          className="sto-select"
          value={formData.masterId || ''}
          onChange={e => setFormData({ ...formData, masterId: e.target.value })}
        >
          <option value="">Не призначено</option>
          {masters && masters.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.status})
            </option>
          ))}
        </select>
      </div>

      <label className="d-flex align-items-center gap-2 p-1" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={isUrgent}
          onChange={e => setIsUrgent(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span className="sto-text-danger fw-bold small">Терміново (+20% до вартості)</span>
      </label>
    </div>
  );
};
