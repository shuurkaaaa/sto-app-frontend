import { useState } from 'react';
import { usePrice } from '../../Context/PriceContext';

export const useServiceLogic = () => {
  const { services, categories, addService, updateService, deleteService } = usePrice();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const categoriesForFilter = ['Всі', ...categories.map(categoryItem => {
    return typeof categoryItem === 'object' ? categoryItem.name : categoryItem;
  })];

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingService(null);
  };

  const updateServicePrice = async (serviceId, newPriceValue) => {
    try {
      const existingService = services.find(service => service.id === serviceId);
      if (!existingService) return;

      const updatedPriceData = {
        name: existingService.name,
        price: Number(newPriceValue),
        oldPrice: existingService.price,
        category: existingService.priceCategory?.name || existingService.categoryName,
        time: existingService.time,
        linkedParts: existingService.serviceParts || existingService.parts || [],
        recommendations: existingService.recommendations
      };
      await updateService(serviceId, updatedPriceData);
    } catch (error) {
      console.error("Помилка при швидкому оновленні ціни:", error);
    }
  };

  const addNewService = async (formData) => {
    try {
      const partsToLink = (formData.linkedParts || []).map((linkedPart) => {
        return {
          inventoryId: linkedPart.itemId,
          quantity: Number(linkedPart.quantity)
        };
      });

      const serviceData = {
        name: formData.name,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        category: formData.category || "Загальне",
        time: Number(formData.time) || 0,
        linkedParts: partsToLink,
        recommendations: formData.recommendations || ""
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await addService(serviceData);
      }

      closeModal();
    } catch (err) {
      console.error("Помилка в функції addNewService:", err);
    }
  };

  const filteredServices = services.filter((service) => {
    const currentServiceCatName = service.priceCategory ? service.priceCategory.name : (service.categoryName || "Загальне");
    const matchesCategory = selectedCategory === 'Всі' || currentServiceCatName === selectedCategory;
    const matchesSearch = (service.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEditClick = (serviceToEdit) => {
    setEditingService(serviceToEdit);
    setIsAddModalOpen(true);
  };

  return {
    filteredServices,
    searchTerm,
    setSearchTerm,
    categories: categoriesForFilter,
    selectedCategory,
    setSelectedCategory,
    isAddModalOpen,
    setIsAddModalOpen,
    closeModal,
    editingService,
    handleEditClick,
    addNewService,
    deleteService,
    updateServicePrice
  };
};