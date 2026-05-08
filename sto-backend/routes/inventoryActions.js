const express = require('express');
const router = express.Router();
const actionsController = require('../controllers/inventoryActionsController');
const logController = require('../controllers/inventoryLogController');
const { upload } = require('../middlewares/uploadConfig');

// --- РОБОТА З ТОВАРАМИ ---
router.get('/', actionsController.getAllItems);
router.post('/add', upload.single('image'), actionsController.addItem);
router.put('/:id', upload.single('image'), actionsController.updateItem);
router.delete('/:id', actionsController.deleteItem);

// --- СКЛАДСЬКІ ОПЕРАЦІЇ ---
router.post('/stock', actionsController.handleStockChange); 
router.patch('/stock-change', actionsController.handleStockChange);

// --- ІСТОРІЯ ТА ЛОГИ ---
router.get('/:id/logs', logController.getItemLogs); 
router.get('/check-sku', actionsController.checkSKU);

module.exports = router;