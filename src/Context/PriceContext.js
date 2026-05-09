import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const PriceContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  withCredentials: true
});

export const PriceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const normalizeService = (s) => {
    if (!s) return s;
    const parts = (s.serviceParts || []).map(sp => ({
      inventoryId: sp.inventoryId,
      itemId: sp.inventoryId,
      quantity: sp.quantity,
      name: sp.inventory?.name || sp.name || '—',
    }));
    return { ...s, parts, linkedParts: parts };
  };

  // Функція для повного оновлення даних прайсу з сервера
  const fetchPriceData = useCallback(async function() {
    try {
      const servicesResponse = await api.get(`${API_BASE_URL}/services`);
      const categoriesResponse = await api.get(`${API_BASE_URL}/price-categories`);

      const list = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
      setServices(list.map(normalizeService));
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Помилка завантаження даних прайсу:", error);
    }
  }, []);

  // Викликаємо завантаження при першому запуску
  useEffect(function() {
    fetchPriceData();
  }, [fetchPriceData]);

  // Додавання нової категорії послуг
  const addCategory = async function(categoryInput) {
    let nameToPost;
    if (typeof categoryInput === 'object') {
      nameToPost = categoryInput.name;
    } else {
      nameToPost = categoryInput;
    }

    if (!nameToPost) return;

    try {
      const response = await api.post(`${API_BASE_URL}/price-categories`, { 
        name: nameToPost 
      });
      setCategories(function(prev) {
        return [...prev, response.data];
      });
    } catch (error) {
      console.error("Помилка додавання категорії:", error);
    }
  };

  // Оновлення назви існуючої категорії
  const updateCategory = async function(categoryId, newName) {
    try {
      const response = await api.put(`${API_BASE_URL}/price-categories/${categoryId}`, { 
        name: newName 
      });
      
      // Оновлюємо список категорій
      setCategories(function(prev) {
        return prev.map(function(cat) {
          return cat.id === categoryId ? response.data : cat;
        });
      });
      
      // Оновлюємо дані в послугах (безпечно обробляємо можливий null у priceCategory)
      setServices(function(prevServices) {
        return prevServices.map(function(service) {
          if (service.priceCategory?.id === categoryId) {
            return { ...service, priceCategory: response.data };
          }
          return service;
        });
      });
    } catch (error) {
      console.error("Помилка оновлення категорії:", error);
    }
  };

  // Видалення категорії
  const deleteCategory = async function(categoryName) {
    try {
      const category = categories.find(function(cat) {
        const currentName = cat.name || cat;
        return currentName === categoryName;
      });

      if (category && category.id) {
        await api.delete(`${API_BASE_URL}/price-categories/${category.id}`);
        
        setCategories(function(prev) {
          return prev.filter(function(cat) {
            const currentName = cat.name || cat;
            return currentName !== categoryName;
          });
        });
        
        // Після видалення категорії, послуги можуть змінити прив'язку, тому оновлюємо все
        await fetchPriceData();
      }
    } catch (error) {
      console.error("Помилка видалення категорії:", error);
    }
  };

  // Додавання нової послуги
  const addService = async function(serviceData) {
    try {
      const foundCat = categories.find(function(cat) {
        return (cat.name || cat) === serviceData.category;
      });

      const payload = {
        name: serviceData.name,
        price: serviceData.price,
        oldPrice: serviceData.oldPrice || null,
        recommendations: serviceData.recommendations,
        time: serviceData.time,
        category: serviceData.category,
        categoryId: foundCat ? foundCat.id : null,
        linkedParts: serviceData.linkedParts || [],
      };

      const response = await api.post(`${API_BASE_URL}/services/add`, payload);
      setServices(function(prev) {
        return [normalizeService(response.data), ...prev];
      });
      return response.data;
    } catch (error) {
      console.error("Помилка додавання послуги:", error);
      throw error;
    }
  };

  // Оновлення існуючої послуги
  const updateService = async function(id, serviceData) {
    try {
      const foundCat = categories.find(function(cat) {
        return (cat.name || cat) === serviceData.category;
      });

      const payload = {
        name: serviceData.name,
        price: serviceData.price,
        oldPrice: serviceData.oldPrice || null,
        recommendations: serviceData.recommendations,
        time: serviceData.time,
        category: serviceData.category,
        categoryId: foundCat ? foundCat.id : null,
        linkedParts: serviceData.linkedParts || [],
      };

      const response = await api.put(`${API_BASE_URL}/services/${id}`, payload);
      setServices(function(prev) {
        return prev.map(function(s) {
          return s.id === id ? normalizeService(response.data) : s;
        });
      });
      return response.data;
    } catch (error) {
      console.error("Помилка оновлення послуги:", error);
      throw error;
    }
  };

  // Видалення послуги з прайсу
  const deleteService = async function(id) {
    try {
      await api.delete(`${API_BASE_URL}/services/${id}`);
      setServices(function(prev) {
        return prev.filter(function(s) {
          return s.id !== id;
        });
      });
    } catch (error) {
      console.error("Помилка видалення послуги:", error);
    }
  };

  return (
    <PriceContext.Provider value={{ 
      services, 
      categories, 
      addCategory, 
      updateCategory, 
      deleteCategory, 
      addService, 
      updateService, 
      deleteService, 
      fetchPriceData 
    }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePrice = () => useContext(PriceContext);