const express = require('express');
const priceCategoryRoutes = express.Router();
const priceCategoryController = require('../controllers/priceCategoryController');
const auth = require('../middlewares/authMiddleware');

priceCategoryRoutes.use(auth);

priceCategoryRoutes.get('/', priceCategoryController.getPriceCategories);


priceCategoryRoutes.post('/', priceCategoryController.createPriceCategory);


priceCategoryRoutes.put('/:id', priceCategoryController.updatePriceCategory);


priceCategoryRoutes.delete('/:id', priceCategoryController.deletePriceCategory);

module.exports = priceCategoryRoutes;