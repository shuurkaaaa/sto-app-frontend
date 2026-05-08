import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const PriceContext = createContext();

// Змінено порт на 5000 та адресу на 127.0.0.1 для стабільної роботи
const API_BASE_URL = 'http://localhost:5000/api';

// Створюємо екземпляр axios із налаштуваннями для передачі cookies/сесій
const api = axios.create({
  withCredentials: true
});

export const PriceProvider = ({ children }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  // Функція для повного оновлення даних прайсу з сервера
  const fetchPriceData = useCallback(async function() {
    try {
      const servicesResponse = await api.get(`${API_BASE_URL}/services`);
      const categoriesResponse = await api.get(`${API_BASE_URL}/price-categories`);
      
      setServices(servicesResponse.data || []);
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
        recommendations: serviceData.recommendations,
        time: serviceData.time,
        categoryId: foundCat ? foundCat.id : null
      };

      const response = await api.post(`${API_BASE_URL}/services/add`, payload);
      setServices(function(prev) {
        return [response.data, ...prev];
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
        recommendations: serviceData.recommendations,
        time: serviceData.time,
        categoryId: foundCat ? foundCat.id : null
      };

      const response = await api.put(`${API_BASE_URL}/services/${id}`, payload);
      setServices(function(prev) {
        return prev.map(function(s) {
          return s.id === id ? response.data : s;
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