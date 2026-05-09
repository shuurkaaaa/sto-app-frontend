import React, { useState } from 'react';
import { useServiceLogic } from '../Components/ServiceComponents/useServiceLogic';
import { ServiceAddModal } from '../Components/ServiceComponents/ServiceAddModal';
import { CategoryManager } from '../Components/ServiceComponents/CategoryManager';
import { useOrders } from '../Context/OrdersContext';

const ServiceDiscount = ({ price, oldPrice }) => {
  if (oldPrice && Number(oldPrice) > Number(price)) {
    return (
      <div className="d-flex flex-column align-items-end">
        <span className="sto-text-muted text-decoration-line-through" style={{ fontSize: '11px', opacity: 0.7 }}>{oldPrice} грн</span>
        <span className="sto-text-success fw-bold">{price} грн</span>
      </div>
    );
  }
  return <span className="sto-text-accent fw-bold">{price} грн</span>;
};

const ServiceRecommendations = ({ serviceItem }) => {
  if (!serviceItem.recommendations) return null;
  return (
    <div className="d-flex align-items-start gap-1 mt-2 small fw-medium" style={{ color: '#FCD34D' }}>
      <span>Порада:</span>
      <span className="fst-italic">{serviceItem.recommendations}</span>
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
    updateServicePrice,
  } = useServiceLogic();

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
            <thead><tr><th>Послуга</th><th>Категорія</th><th>Ціна</th></tr></thead>
            <tbody>
              ${filteredServices.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${s.priceCategory?.name || s.categoryName || 'Загальне'}</td>
                  <td class="price-col">${s.price} грн</td>
                </tr>`).join('')}
            </tbody>
          </table>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const isPopular = (serviceName) => {
    if (!orders || !serviceName) return false;
    const count = orders.filter(o => o.serviceName?.toLowerCase().includes(serviceName?.toLowerCase())).length;
    return count >= 3;
  };

  return (
    <div className="sto-page" style={{ width: '95%', maxWidth: '1600px', margin: '0 auto' }}>
      <div className="mb-4">
        <div className="d-flex gap-3 w-100 mb-3">
          <input
            className="sto-input flex-grow-1"
            placeholder="Пошук по базі послуг..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handlePrint} className="sto-btn sto-btn-secondary text-nowrap">Друк прайсу</button>
        </div>

        <button className="sto-btn text-white" style={{ background: '#10B981' }} onClick={() => handleEditClick(null)}>
          Створити послугу
        </button>
      </div>

      <CategoryManager />

      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((category, index) => {
          const categoryName = typeof category === 'object' ? category.name : category;
          return (
            <button
              key={`category-btn-${index}`}
              onClick={() => setSelectedCategory(categoryName)}
              className={`px-3 py-2 rounded-pill fw-semibold small border ${selectedCategory === categoryName ? 'text-white' : 'sto-text-muted'}`}
              style={{
                background: selectedCategory === categoryName ? 'var(--sto-accent)' : 'var(--sto-bg-2)',
                borderColor: 'rgba(148,163,184,0.1)',
                cursor: 'pointer',
              }}
            >
              {categoryName}
            </button>
          );
        })}
      </div>

      <div className="sto-table-card w-100">
        <table className="sto-table">
          <thead>
            <tr>
              <th>ПОСЛУГА ТА ДЕТАЛІ</th>
              <th>КАТЕГОРІЯ</th>
              <th>ЦІНА (ГРН)</th>
              <th className="text-center">КЕРУВАННЯ</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length > 0 ? (
              filteredServices.map((serviceItem) => (
                <tr key={serviceItem.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="text-light fw-semibold">{serviceItem.name}</span>
                      {isPopular(serviceItem.name) && (
                        <span className="rounded-1 fw-bold" style={{ color: '#F59E0B', fontSize: '10px', border: '1px solid #F59E0B', padding: '1px 5px' }}>
                          POPULAR
                        </span>
                      )}
                      {serviceItem.time > 0 && (
                        <span className="rounded-2 sto-text-muted px-2 py-1 border" style={{ background: 'var(--sto-bg)', borderColor: 'var(--sto-border)', fontSize: '11px' }}>
                          {serviceItem.time} хв.
                        </span>
                      )}
                    </div>

                    {((serviceItem.parts || serviceItem.linkedParts) && (serviceItem.parts || serviceItem.linkedParts).length > 0) && (
                      <div className="sto-text-dim small mt-2 d-flex align-items-center gap-1">
                        <span className="sto-text-accent">Склад:</span>
                        {(serviceItem.parts || serviceItem.linkedParts).map((part, pIdx, arr) => (
                          <span key={`part-${serviceItem.id}-${pIdx}`}>
                            {part.name} (x{part.quantity || 1}){pIdx < arr.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    <ServiceRecommendations serviceItem={serviceItem} />
                  </td>

                  <td>
                    <span className="sto-badge-category">
                      {serviceItem.priceCategory ? serviceItem.priceCategory.name : (serviceItem.categoryName || 'Загальне')}
                    </span>
                  </td>

                  <td>
                    {editingPriceId === serviceItem.id ? (
                      <input
                        autoFocus
                        type="number"
                        defaultValue={serviceItem.price}
                        onBlur={(e) => { updateServicePrice(serviceItem.id, e.target.value); setEditingPriceId(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { updateServicePrice(serviceItem.id, e.target.value); setEditingPriceId(null); } }}
                        className="sto-input"
                        style={{ width: '80px', borderColor: 'var(--sto-accent)' }}
                      />
                    ) : (
                      <div onClick={() => setEditingPriceId(serviceItem.id)} style={{ cursor: 'pointer' }}>
                        <ServiceDiscount price={serviceItem.price} oldPrice={serviceItem.oldPrice} />
                      </div>
                    )}
                  </td>

                  <td className="text-center">
                    <button onClick={() => handleEditClick(serviceItem)} className="btn btn-sm sto-text-accent fw-semibold me-3" style={{ background: 'none', border: 'none' }}>
                      Редагувати
                    </button>
                    <button onClick={() => deleteService(serviceItem.id)} className="btn btn-sm sto-text-danger fw-semibold" style={{ background: 'none', border: 'none' }}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center sto-text-dim py-5">
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
