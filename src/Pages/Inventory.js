import React, { useState } from 'react';
import { useInventoryLogic } from '../Components/InventoryComponents/useInventoryLogic';
import { InventoryHeader } from '../Components/InventoryComponents/InventoryHeader';
import { InventoryStats } from '../Components/InventoryComponents/InventoryStats';
import { InventoryToolbar } from '../Components/InventoryComponents/InventoryToolbar';
import { InventoryTable } from '../Components/InventoryComponents/InventoryTable';
import { InventoryAddScreen } from '../Components/InventoryComponents/InventoryAddScreen';
import { PurchaseOrderBtn } from '../Components/InventoryComponents/PurchaseOrderBtn';
import { EditItemModal } from '../Components/InventoryComponents/EditItemModal';
import HistoryModal from '../Components/InventoryComponents/HistoryModal'; 
import { PrintSection } from '../Components/InventoryComponents/PrintSection';
import { inventoryStyles } from '../Components/InventoryComponents/InventoryStyles';
import { CategoryFilters } from '../Components/InventoryComponents/CategoryFilters';
import { CarManagerModal } from '../Components/InventoryComponents/CarManagerModal';
import { useInventoryContext } from '../Context/InventoryContext';

const Inventory = () => {
  // Отримуємо розширену логіку фільтрації та управління станом інтерфейсу з хука
  const {
    filteredItems, 
    searchTerm, 
    setSearchTerm, 
    currentView, 
    setCurrentView,
    selectedCategory, 
    setSelectedCategory, 
    showLowStock, 
    setShowLowStock,
    stats, 
    updateStock, 
    fetchInventory, 
    deleteItem
  } = useInventoryLogic();

  // Отримуємо методи безпосередньо з контексту для виконання операцій запису
  const { updateItem, items } = useInventoryContext();

  // Локальні стани для керування модальними вікнами
  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [isCarManagerOpen, setIsCarManagerOpen] = useState(false);

  /**
   * Обробник збереження після редагування товару.
   * Передає дані на бекенд через контекст та закриває вікно.
   */
  const handleSaveEdit = async (formData) => {
    try {
      if (!editingItem?.id) {
        alert("Помилка: ID товару втрачено.");
        return;
      }

      // Викликаємо оновлення через провайдер (підтримує як JSON, так і FormData)
      await updateItem(editingItem.id, formData);
      
      // Закриваємо модальне вікно при успішному результаті
      setEditingItem(null); 
    } catch (error) {
      console.error("Помилка при збереженні змін:", error);
      alert("Не вдалося оновити товар. Перевірте заповнення полів.");
    }
  };

  return (
    <div style={inventoryStyles.container}>
      {/* ВЕРХНЯ ПАНЕЛЬ: Заголовок та основні функціональні кнопки */}
      <div style={inventoryStyles.headerRow}> 
        <InventoryHeader />
        <div style={inventoryStyles.actionGroup}>
          
          {/* Кнопка "База автомобілів" для доступу до специфікацій та підбору запчастин */}
          <button 
            onClick={() => setIsCarManagerOpen(true)}
            style={{
              ...inventoryStyles.purchaseButton, 
              backgroundColor: '#1E293B', 
              color: '#818CF8', 
              border: '1px solid #334155', 
              marginRight: '10px'
            }}
          >
            БАЗА АВТОМОБІЛІВ
          </button>
          
          {/* Кнопка формування замовлення. 
              ВАЖЛИВО: Передаємо вихідний список 'items' (з контексту), 
              щоб функція замовлення враховувала весь дефіцит, 
              навіть якщо зараз застосовано фільтр пошуку. */}
          <PurchaseOrderBtn items={items} />

          {/* Кнопка перемикання на екран додавання (прийому) нових товарів */}
          <button 
            onClick={() => setCurrentView('add')} 
            style={inventoryStyles.mainAddButton}
          >
            ПРИЙНЯТИ ТОВАР
          </button>
        </div>
      </div>

      {/* БЛОК СТАТИСТИКИ: Візуалізація фінансового стану та критичних залишків */}
      <InventoryStats 
        totalValue={stats.totalValue} 
        deficitCount={stats.deficitCount} 
      />

      {/* ФІЛЬТРАЦІЯ: Вибір категорії та швидке перемикання на товари в дефіциті */}
      <CategoryFilters 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory}
        isLowStockFilter={showLowStock}
        onToggleLowStock={() => setShowLowStock(!showLowStock)}
        deficitCount={stats.deficitCount}
      />

      {/* ТУЛБАР: Поле глобального пошуку по базі */}
      <InventoryToolbar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      {/* ТАБЛИЦЯ: Відображення відфільтрованих даних та кнопки управління рядком */}
      <InventoryTable 
        items={filteredItems} 
        onUpdateStock={updateStock} 
        onDelete={deleteItem} 
        onEdit={(item) => setEditingItem(item)}
        onShowHistory={setHistoryItem}
        onTagClick={setSearchTerm}
      />

      {/* --- МОДАЛЬНІ ВІКНА ТА СЕРВІСНІ ЕКРАНИ --- */}

      {/* Модальне вікно підбору автомобілів */}
      {isCarManagerOpen && (
        <CarManagerModal onClose={() => setIsCarManagerOpen(false)} />
      )}

      {/* Екран приходу товару: Відображається поверх або замість списку за умови currentView === 'add' */}
      {currentView === 'add' && (
        <InventoryAddScreen 
          onBack={() => setCurrentView('list')} 
          onSave={fetchInventory} 
        />
      )}
      
      {/* Модальне вікно редагування параметрів товару */}
      {editingItem && (
        <EditItemModal 
          inventoryItem={editingItem} 
          onClose={() => setEditingItem(null)} 
          onSave={handleSaveEdit} 
        />
      )}

      {/* Модальне вікно детальної історії операцій (логівання) по товару */}
      {historyItem && (
        <HistoryModal 
          item={historyItem} 
          onClose={() => setHistoryItem(null)} 
        />
      )}

      {/* Прихована секція для генерації друкованої форми складу */}
      <PrintSection items={filteredItems} />
    </div>
  );
};

export default Inventory;