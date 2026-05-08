const express = require('express');
const router = express.Router();
const authController = require('./authController');
const auth = require('../middlewares/authMiddleware');

/**
 * МАРШРУТИ АВТОРИЗАЦІЇ
 */

// Публічні маршрути (доступні всім)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Захищені маршрути (потребують валідний JWT токен)
router.get('/me', auth, authController.checkStatus);
router.post('/update-password', auth, authController.updatePassword);

module.exports = router;