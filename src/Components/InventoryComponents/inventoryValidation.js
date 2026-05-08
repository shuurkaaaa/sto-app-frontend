// src/Components/InventoryComponents/inventoryValidation.js

export const validateInventoryItem = (data) => {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = "Назва обов'язкова";
  }
  
  if (!data.stockKeepingUnit || !data.stockKeepingUnit.trim()) {
    errors.sku = "Артикул обов'язковий";
  }
  
  if (Number(data.price) < 0) {
    errors.price = "Ціна не може бути від'ємною";
  }

  return errors; // Повертає об'єкт помилок (якщо порожній - форма валідна)
};