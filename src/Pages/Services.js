import React, { useState } from 'react';
import { useServiceLogic } from '../Components/ServiceComponents/useServiceLogic';
import { serviceStyles } from '../Components/ServiceComponents/ServiceStyles';
import { ServiceAddModal } from '../Components/ServiceComponents/ServiceAddModal';
import { CategoryManager } from '../Components/ServiceComponents/CategoryManager';
import { useOrders } from '../Context/OrdersContext'; 

// Компонент для відображення ціни та знижки
const ServiceDiscount = ({ price, oldPrice }) => {
  if (oldPrice && Number(oldPrice) > Number(price)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '11px', opacity: 0.7 }}>
          {oldPrice} грн
        </span>
        <span style={{ color: '#4ADE80', fontWeight: 'bold' }}>{price} грн</span>
      </div>
    );
  }
  return <span style={{ color: '#818CF8', fontWeight: 'bold' }}>{price} грн</span>;
};

// Компонент для відображення твоїх нотаток/рекомендацій з модального вікна
const ServiceRecommendations = ({ serviceItem }) => {
  if (!serviceItem.recommendations) return null;

  return (
    <div style={{ 
      fontSize: '11px', 
      color: '#FCD34D', 
      marginTop: '6px', 
      fontWeight: '500', 
      display: 'flex', 
      alignItems: 'start', 
      gap: '4px' 
    }}>
      <span>Порада:</span>
      <span style={{ fontStyle: 'italic' }}>{serviceItem.recommendations}</span>
    </div>
  );
};

const Services = () => {
  const { orders } = useOrders();
  const [editingPriceId, setEditingPriceId] = useState(null);

  const {
    filteredServices,
    searchTerm,
    setSearchTerm,
    categories,
    selectedCategory,
    setSelectedCategory,
    isAddModalOpen,
    closeModal,
    editingService,
    handleEditClick,
    addNewService,
    deleteService,
    updateServicePrice 
  } = useServiceLogic();

  // Уніфікований стиль кнопок згідно з дизайном (pill shape)
  const pillButtonStyle = {
    padding: '10px 24px',
    borderRadius: '20px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString('uk-UA');
    
    const html = `
      <html>
        <head>
          <title>Прайс-лист - ${date}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #1e293b; }
            h1 { text-align: center; color: #0f172a; }
            .date { text-align: center; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; background: #f1f5f9; padding: 10px; border: 1px solid #e2e8f0; }
            td { padding: 10px; border: 1px solid #e2e8f0; }
            .price-col { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Прайс-лист послуг</h1>
          <div class="date">Дата: ${date}</div>
          <table>
            <thead>
              <tr>
                <th>Послуга</th>
                <th>Категорія</th>
                <th>Ціна</th>
              </tr>
            </thead>
            <tbody>
              ${filteredServices.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${s.priceCategory?.name || s.categoryName || 'Загальне'}</td>
                  <td class="price-col">${s.price} грн</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const isPopular = (serviceName) => {
    if (!orders || !serviceName) return false;
    const count = orders.filter(o => 
      o.serviceName?.toLowerCase().includes(serviceName?.toLowerCase())
    ).length;
    return count >= 3; 
  };

  return (
    <div style={{ ...serviceStyles.container, width: '95%', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ ...serviceStyles.header, flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <input
            style={{ ...serviceStyles.searchInput, flex: 1 }}
            placeholder="Пошук по базі послуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={handlePrint}
            style={{
              ...pillButtonStyle,
              backgroundColor: '#1E293B',
              color: '#94A3B8'
            }}
          >
            Друк прайсу
          </button>
        </div>

        <button 
          style={{
            ...pillButtonStyle,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            marginTop: '16px' // Опустив кнопку нижче від пошуку
          }}
          onClick={() => handleEditClick(null)}
        >
          Створити послугу
        </button>
      </div>

      <CategoryManager />

      <div style={serviceStyles.filterBar}>
        {categories.map((category, index) => {
          const categoryName = typeof category === 'object' ? category.name : category;
          return (
            <button
              key={`category-btn-${index}`} 
              onClick={() => setSelectedCategory(categoryName)}
              style={{
                ...serviceStyles.catButton,
                backgroundColor: selectedCategory === categoryName ? '#818CF8' : '#1E293B',
                color: selectedCategory === categoryName ? '#FFFFFF' : '#94A3B8',
                borderRadius: '20px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}
            >
              {categoryName}
            </button>
          );
        })}
      </div>

      <div style={{ ...serviceStyles.tableCard, width: '100%' }}>
        <table style={serviceStyles.table}>
          <thead>
            <tr>
              <th style={serviceStyles.th}>ПОСЛУГА ТА ДЕТАЛІ</th>
              <th style={serviceStyles.th}>КАТЕГОРІЯ</th>
              <th style={serviceStyles.th}>ЦІНА (ГРН)</th>
              <th style={{ ...serviceStyles.th, textAlign: 'center' }}>КЕРУВАННЯ</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((serviceItem) => (
                <tr key={serviceItem.id} style={serviceStyles.tr}>
                  <td style={serviceStyles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#F1F5F9', fontWeight: '600' }}>{serviceItem.name}</span>
                      
                      {isPopular(serviceItem.name) && (
                        <span style={{ 
                          color: '#F59E0B', 
                          fontSize: '10px', 
                          fontWeight: 'bold', 
                          border: '1px solid #F59E0B', 
                          padding: '1px 5px', 
                          borderRadius: '4px'
                        }}>
                          POPULAR
                        </span>
                      )}
                      
                      {serviceItem.time > 0 && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#94A3B8', 
                          backgroundColor: '#0F172A', 
                          padding: '2px 8px', 
                          borderRadius: '6px',
                          border: '1px solid #334155'
                        }}>
                          {serviceItem.time} хв.
                        </span>
                      )}
                    </div>

                    {((serviceItem.parts || serviceItem.linkedParts) && 
                      (serviceItem.parts || serviceItem.linkedParts).length > 0) && (
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#818CF8' }}>Склад:</span>
                        {(serviceItem.parts || serviceItem.linkedParts).map((part, pIdx, arr) => (
                          <span key={`part-${serviceItem.id}-${pIdx}`}>
                            {part.name} (x{part.quantity || 1})
                            {pIdx < arr.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    <ServiceRecommendations serviceItem={serviceItem} />
                  </td>

                  <td style={serviceStyles.td}>
                    <span style={serviceStyles.badge}>
                      {serviceItem.priceCategory ? serviceItem.priceCategory.name : (serviceItem.categoryName || 'Загальне')}
                    </span>
                  </td>

                  <td style={serviceStyles.td}>
                    {editingPriceId === serviceItem.id ? (
                      <input 
                        autoFocus
                        type="number"
                        defaultValue={serviceItem.price}
                        onBlur={(e) => {
                          updateServicePrice(serviceItem.id, e.target.value);
                          setEditingPriceId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateServicePrice(serviceItem.id, e.target.value);
                            setEditingPriceId(null);
                          }
                        }}
                        style={{ 
                          width: '80px', 
                          padding: '6px', 
                          borderRadius: '6px', 
                          border: '1px solid #818CF8',
                          backgroundColor: '#0F172A',
                          color: '#F1F5F9',
                          outline: 'none'
                        }}
                      />
                    ) : (
                      <div 
                        onClick={() => setEditingPriceId(serviceItem.id)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <ServiceDiscount price={serviceItem.price} oldPrice={serviceItem.oldPrice} />
                      </div>
                    )}
                  </td>

                  <td style={{ ...serviceStyles.td, textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEditClick(serviceItem)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#818CF8', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        marginRight: '15px' 
                      }}
                    >
                      Редагувати
                    </button>
                    <button 
                      onClick={() => deleteService(serviceItem.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#EF4444', 
                        cursor: 'pointer', 
                        fontWeight: '600' 
                      }}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#64748B', padding: '50px' }}>
                  Нічого не знайдено за вашим запитом.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ServiceAddModal
        isOpen={isAddModalOpen}
        onClose={closeModal} 
        onAdd={addNewService} 
        categories={categories}
        editData={editingService}
      />
    </div>
  );
};

export default Services;