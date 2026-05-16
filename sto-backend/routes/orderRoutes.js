const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', orderController.getAllOrders);

router.post('/', orderController.createOrder);

router.put('/:id', orderController.updateOrder);

router.put('/:id/status', orderController.updateStatus);

router.delete('/:id', orderController.deleteOrder);

module.exports = router;
