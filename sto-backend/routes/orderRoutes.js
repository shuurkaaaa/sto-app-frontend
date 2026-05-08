const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// --- МАРШРУТИ ДЛЯ РОБОТИ ІЗ ЗАМОВЛЕННЯМИ ---

/**
 * Отримати список усіх замовлень
 */
router.get('/', orderController.getAllOrders);

/**
 * Створити нове замовлення
 */
router.post('/', orderController.createOrder);

/**
 * ПОВНЕ ОНОВЛЕННЯ замовлення
 */
router.put('/:id', orderController.updateOrder);

/**
 * Оновити тільки статус або змінити майстра
 */
router.put('/:id/status', orderController.updateStatus);

/**
 * Видалити замовлення
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;