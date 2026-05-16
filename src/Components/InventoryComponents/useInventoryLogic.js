import { useState, useMemo } from 'react';
import { useInventoryContext } from '../../Context/InventoryContext';
import { apiClient } from '../../services/apiClient';

export const useInventoryLogic = () => {

  const { items, fetchInventory, removeItem } = useInventoryContext();


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [showLowStock, setShowLowStock] = useState(false);
  const [currentView, setCurrentView] = useState('list');

  const filteredItems = useMemo(() => {

    const data = Array.isArray(items) ? items : [];

    return data.filter(item => {

      const name = (item.name || '').toLowerCase();
      const sku = (item.stockKeepingUnit || item.sku || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = name.includes(search) || sku.includes(search);


      const itemCatName = item.category?.name || '';
      const itemCatId = String(item.categoryId || '');
      const currentSelected = String(selectedCategory);

      const matchesCategory = currentSelected === 'Всі' ||
                              currentSelected === 'all' ||
                              itemCatName === selectedCategory ||
                              itemCatId === currentSelected;




      const currentQty = Number(item.current || 0);
      const minQty = Number(item.minimum || item.min || 0);

      const matchesLowStock = showLowStock
        ? currentQty <= minQty
        : true;


      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [items, searchTerm, selectedCategory, showLowStock]);

  const stats = useMemo(() => {
    const data = Array.isArray(items) ? items : [];
    return data.reduce((acc, item) => {
      const current = Number(item.current || 0);
      const price = Number(item.price || 0);
      const minQty = Number(item.minimum || item.min || 0);


      acc.totalValue += (current * price);


      if (current <= minQty) {
        acc.deficitCount += 1;
      }
      return acc;
    }, { totalValue: 0, deficitCount: 0 });
  }, [items]);

  const updateStock = async (id, delta, note = '') => {

    const item = items.find(i => String(i.id) === String(id));
    if (!item) return;

    const currentQty = Number(item.current || 0);
    const change = Number(delta);


    if (change < 0 && Math.abs(change) > currentQty) {
      alert(`Неможливо списати ${Math.abs(change)} шт. На складі лише ${currentQty} шт.`);
      return;
    }

    try {

      await apiClient.post('/inventory-actions/stock', {
        id: Number(id),
        quantity: change,
        note: note || (change > 0 ? "Прихід товару" : "Списання")
      });


      await fetchInventory();
    } catch (error) {
      console.error("Stock update error:", error);
      alert("Помилка оновлення залишків на сервері. Перевірте з'єднання.");
    }
  };

  const deleteItem = async (id) => {

    if (!window.confirm("Ви впевнені, що хочете видалити цей товар назавжди? Це видалить також історію рухів товару.")) {
      return;
    }

    try {

      await removeItem(id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Не вдалося видалити товар. Можливо, він використовується в замовленнях.");
    }
  };


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