const express = require('express');
const router = express.Router();
const actionsController = require('../controllers/inventoryActionsController');
const logController = require('../controllers/inventoryLogController');
const { upload } = require('../middlewares/uploadConfig');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', actionsController.getAllItems);
router.get('/check-sku', actionsController.checkSKU);
router.post('/add', upload.single('image'), actionsController.addItem);
router.put('/:id', upload.single('image'), actionsController.updateItem);
router.delete('/:id', actionsController.deleteItem);


router.post('/stock', actionsController.handleStockChange);
router.patch('/stock-change', actionsController.handleStockChange);

router.get('/order/:orderId/logs', logController.getLogsByOrderId);

router.get('/:id/logs', logController.getItemLogs);

module.exports = router;