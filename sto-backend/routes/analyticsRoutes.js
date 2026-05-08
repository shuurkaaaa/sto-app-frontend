const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Маршрут відкритий для запитів без перевірки токена
router.get('/summary', analyticsController.getAnalyticsSummary);

module.exports = router;