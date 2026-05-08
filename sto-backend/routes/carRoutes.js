const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');

// Маршрути для МАРОК (Brands)
// URL: /api/cars/brands
router.get('/brands', carController.getAllBrands);         // Отримати всі марки
router.post('/brands', carController.createBrand);        // Створити нову марку
router.put('/brands/:id', carController.updateBrand);     // Редагувати назву марки за ID
router.delete('/brands/:id', carController.deleteBrand);  // Видалити марку за ID

// Маршрути для МОДЕЛЕЙ (Models)
// URL: /api/cars/models
router.post('/models', carController.createModel);        // Створити модель для марки
router.put('/models/:id', carController.updateModel);     // Редагувати модель за ID
router.delete('/models/:id', carController.deleteModel);  // Видалити модель за ID

module.exports = router;