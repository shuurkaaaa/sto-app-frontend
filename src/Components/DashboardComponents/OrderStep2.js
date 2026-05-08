import React from 'react';

export const OrderStep2 = ({ 
  services, selectedServices, handleServiceClick, 
  masters, formData, setFormData, isUrgent, setIsUrgent, 
  searchTerm, setSearchTerm, setIsPickerOpen, styles 
}) => {
  
  const filteredServices = (services || []).filter(s => {
    const searchLower = (searchTerm || "").toLowerCase();
    const nameMatch = (s.name || "").toLowerCase().includes(searchLower);
    const catName = s.priceCategory?.name || s.categoryName || s.category || "";
    const categoryMatch = catName.toLowerCase().includes(searchLower);
    return nameMatch || categoryMatch;
  });

  const inputStyle = typeof styles.input === 'function' ? styles.input(false) : (styles.input || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <p style={styles.label}>ВИБЕРІТЬ ПОСЛУГИ З ПРАЙСУ:</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input 
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }} 
            placeholder="Пошук (назва або категорія)..." 
            value={searchTerm || ""}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button 
            type="button"
            onClick={() => setIsPickerOpen(true)} 
            style={{...(styles.btnSec || {}), whiteSpace: 'nowrap'}}
          >
            📚 Каталог
          </button>
        </div>
        
        <div style={{ 
          height: '180px', 
          overflowY: 'auto', 
          border: '1px solid #334155', 
          borderRadius: '12px', 
          padding: '10px', 
          background: '#0F172A' 
        }}>
          {filteredServices.length > 0 ? (
            filteredServices.map(s => {
              const isSelected = selectedServices.some(i => i.id === s.id);
              return (
                <div 
                  key={s.id} 
                  onClick={() => handleServiceClick(s)}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: '0.2s',
                    backgroundColor: isSelected ? '#1e3a8a' : '#1e293b',
                    borderColor: isSelected ? '#3b82f6' : '#334155',
                    color: isSelected ? '#fff' : '#cbd5e1'
                  }}
                >
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>
                      {s.priceCategory?.name || s.categoryName || s.category || 'Загальне'}
                    </span>
                    <span style={{ fontWeight: '500' }}>{s.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 'bold', color: '#4ade80', display: 'block' }}>{s.price} грн</span>
                    {isSelected && <span style={{ fontSize: '12px' }}>✅</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{textAlign: 'center', color: '#64748b', marginTop: '70px'}}>
              Послуг не знайдено
            </div>
          )}
        </div>
      </div>

      <div>
        <p style={styles.label}>ПРИЗНАЧИТИ МАЙСТРА:</p>
        <select 
          style={inputStyle}
          value={formData.masterId || ""}
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

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px' }}>
        <input 
          type="checkbox" 
          checked={isUrgent} 
          onChange={e => setIsUrgent(e.target.checked)} 
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>
          Терміново (+20% до вартості)
        </span>
      </label>
    </div>
  );
};