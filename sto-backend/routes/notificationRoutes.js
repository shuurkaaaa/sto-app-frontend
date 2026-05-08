const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  createNotification, 
  deleteNotification,
  clearAllNotifications 
} = require('../controllers/notificationController');

/**
 * Маршрути системи сповіщень OneWayLogistic
 */

// 1. Отримати список усіх сповіщень (Системні + Свіжі замітки)
router.get('/', getNotifications);

// 2. Створити нову персональну замітку
router.post('/', createNotification);

// 3. ВИДАЛИТИ ВСІ РУЧНІ ЗАМІТКИ
// ВАЖЛИВО: Цей маршрут має бути вище за /:id, щоб 'clear-all' не сприйнявся як ID
router.delete('/clear-all', clearAllNotifications);

// 4. Видалити одну замітку за її ID
router.delete('/:id', deleteNotification);

module.exports = router;