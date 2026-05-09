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
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/reset-password/:token/verify', authController.verifyResetToken);

// Захищені маршрути (потребують валідний JWT токен)
router.get('/me', auth, authController.checkStatus);
router.post('/update-password', auth, authController.updatePassword);

module.exports = router;