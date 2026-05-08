const express = require('express');
const priceCategoryRoutes = express.Router();
const priceCategoryController = require('../controllers/priceCategoryController');

// Маршрут для отримання всіх категорій
priceCategoryRoutes.get('/', priceCategoryController.getPriceCategories);

// Маршрут для створення нової категорії
priceCategoryRoutes.post('/', priceCategoryController.createPriceCategory);

// Маршрут для оновлення назви категорії за її ID
priceCategoryRoutes.put('/:id', priceCategoryController.updatePriceCategory);

// Маршрут для видалення категорії за її ID
priceCategoryRoutes.delete('/:id', priceCategoryController.deletePriceCategory);

module.exports = priceCategoryRoutes;