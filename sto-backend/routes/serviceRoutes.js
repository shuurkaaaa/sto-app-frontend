const express = require('express');
const serviceRoutes = express.Router();
const serviceController = require('../controllers/serviceController');

// Отримати список усіх послуг (Прайс-лист)
serviceRoutes.get('/', serviceController.getServices);

// Додати нову послугу
serviceRoutes.post('/add', serviceController.createService);

// Оновити послугу за ID
serviceRoutes.put('/:id', serviceController.updateService);

// Видалити послугу за ID
serviceRoutes.delete('/:id', serviceController.deleteService);

module.exports = serviceRoutes;