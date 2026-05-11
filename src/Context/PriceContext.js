import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const PriceContext = createContext();

const API_BASE_URL = '';

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


  const fetchPriceData = useCallback(async function() {
    try {
      const servicesResponse = await apiClient.get(`${API_BASE_URL}/services`);
      const categoriesResponse = await apiClient.get(`${API_BASE_URL}/price-categories`);

      const list = Array.isArray(servicesResponse.data) ? servicesResponse.data : [];
      setServices(list.map(normalizeService));
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error("Помилка завантаження даних прайсу:", error);
    }
  }, []);


  useEffect(function() {
    fetchPriceData();
  }, [fetchPriceData]);


  const addCategory = async function(categoryInput) {
    let nameToPost;
    if (typeof categoryInput === 'object') {
      nameToPost = categoryInput.name;
    } else {
      nameToPost = categoryInput;
    }

    if (!nameToPost) return;

    try {
      const response = await apiClient.post(`${API_BASE_URL}/price-categories`, {
        name: nameToPost
      });
      setCategories(function(prev) {
        return [...prev, response.data];
      });
    } catch (error) {
      console.error("Помилка додавання категорії:", error);
    }
  };


  const updateCategory = async function(categoryId, newName) {
    try {
      const response = await apiClient.put(`${API_BASE_URL}/price-categories/${categoryId}`, {
        name: newName
      });


      setCategories(function(prev) {
        return prev.map(function(cat) {
          return cat.id === categoryId ? response.data : cat;
        });
      });


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


  const deleteCategory = async function(categoryName) {
    try {
      const category = categories.find(function(cat) {
        const currentName = cat.name || cat;
        return currentName === categoryName;
      });

      if (category && category.id) {
        await apiClient.delete(`${API_BASE_URL}/price-categories/${category.id}`);

        setCategories(function(prev) {
          return prev.filter(function(cat) {
            const currentName = cat.name || cat;
            return currentName !== categoryName;
          });
        });


        await fetchPriceData();
      }
    } catch (error) {
      console.error("Помилка видалення категорії:", error);
    }
  };


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

      const response = await apiClient.post(`${API_BASE_URL}/services/add`, payload);
      setServices(function(prev) {
        return [normalizeService(response.data), ...prev];
      });
      return response.data;
    } catch (error) {
      console.error("Помилка додавання послуги:", error);
      throw error;
    }
  };


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

      const response = await apiClient.put(`${API_BASE_URL}/services/${id}`, payload);
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


  const deleteService = async function(id) {
    try {
      await apiClient.delete(`${API_BASE_URL}/services/${id}`);
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