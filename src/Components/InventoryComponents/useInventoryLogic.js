import { useState, useMemo } from 'react';
import axios from 'axios';
import { useInventoryContext } from '../../Context/InventoryContext';

export const useInventoryLogic = () => {
  // Витягуємо необхідні дані та методи з контексту складу
  const { items, fetchInventory, removeItem } = useInventoryContext();
  
  // Локальні стани для керування інтерфейсом користувача
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [showLowStock, setShowLowStock] = useState(false);
  const [currentView, setCurrentView] = useState('list');

  /**
   * Мемоізована фільтрація списку товарів.
   * Виконується лише при зміні вхідних даних (items) або параметрів фільтрації.
   */
  const filteredItems = useMemo(() => {
    // Перевірка на випадок, якщо items ще не завантажені або не є масивом
    const data = Array.isArray(items) ? items : [];
    
    return data.filter(item => {
      // 1. Логіка пошуку: перевіряємо назву та артикул (враховуючи різні назви полів у БД)
      const name = (item.name || '').toLowerCase();
      const sku = (item.stockKeepingUnit || item.sku || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = name.includes(search) || sku.includes(search);
      
      // 2. Логіка фільтрації по категорії: підтримуємо фільтрацію за назвою або ID
      const itemCatName = item.category?.name || '';
      const itemCatId = String(item.categoryId || '');
      const currentSelected = String(selectedCategory);

      const matchesCategory = currentSelected === 'Всі' || 
                              currentSelected === 'all' ||
                              itemCatName === selectedCategory || 
                              itemCatId === currentSelected;
      
      // 3. Логіка перевірки дефіциту (Low Stock):
      // Використовуємо Number() для безпечного порівняння. 
      // Перевіряємо обидва варіанти назви поля мінімальної кількості (minimum/min).
      const currentQty = Number(item.current || 0);
      const minQty = Number(item.minimum || item.min || 0);
      
      const matchesLowStock = showLowStock 
        ? currentQty <= minQty 
        : true;
      
      // Товар відображається, якщо він відповідає всім трьом критеріям
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [items, searchTerm, selectedCategory, showLowStock]);

  /**
   * Мемоізований розрахунок загальної статистики складу.
   * Вираховує загальну вартість активів та кількість позицій, що потребують замовлення.
   */
  const stats = useMemo(() => {
    const data = Array.isArray(items) ? items : [];
    return data.reduce((acc, item) => {
      const current = Number(item.current || 0);
      const price = Number(item.price || 0);
      const minQty = Number(item.minimum || item.min || 0);

      // Додаємо вартість поточної позиції до загальної суми
      acc.totalValue += (current * price);
      
      // Перевіряємо наявність дефіциту для лічильника в статистиці
      if (current <= minQty) {
        acc.deficitCount += 1;
      }
      return acc;
    }, { totalValue: 0, deficitCount: 0 });
  }, [items]);

  /**
   * Функція швидкого оновлення залишків (прихід товару або списання).
   * @param {string|number} id - Унікальний ідентифікатор товару.
   * @param {number} delta - Кількість (позитивна для приходу, негативна для списання).
   * @param {string} note - Коментар до операції (опціонально).
   */
  const updateStock = async (id, delta, note = '') => {
    // Пошук товару в поточному стані для попередньої перевірки (валідації)
    const item = items.find(i => String(i.id) === String(id));
    if (!item) return;

    const currentQty = Number(item.current || 0);
    const change = Number(delta);

    // Валідація: запобігаємо списанню більшої кількості, ніж є фактично на складі
    if (change < 0 && Math.abs(change) > currentQty) {
      alert(`Неможливо списати ${Math.abs(change)} шт. На складі лише ${currentQty} шт.`);
      return;
    }

    try {
      // Відправка POST запиту на сервер для реєстрації складської операції та логування
      await axios.post('http://localhost:5000/api/inventory-actions/stock', { 
        id: Number(id), 
        quantity: change, 
        note: note || (change > 0 ? "Прихід товару" : "Списання")
      });
      
      // Після успішного оновлення в БД, синхронізуємо локальний стан через Context
      await fetchInventory(); 
    } catch (error) {
      console.error("Stock update error:", error);
      alert("Помилка оновлення залишків на сервері. Перевірте з'єднання.");
    }
  };

  /**
   * Функція видалення товару зі складу.
   * @param {string|number} id - ID товару для видалення.
   */
  const deleteItem = async (id) => {
    // Підтвердження дії користувачем
    if (!window.confirm("Ви впевнені, що хочете видалити цей товар назавжди? Це видалить також історію рухів товару.")) {
      return;
    }
    
    try {
      // Викликаємо метод видалення з InventoryContext
      await removeItem(id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Не вдалося видалити товар. Можливо, він використовується в замовленнях.");
    }
  };

  // Повертаємо всі стани та методи для використання в UI компонентах
  return {
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
    deleteItem, 
    fetchInventory
  };
};