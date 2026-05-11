const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/summary', analyticsController.getAnalyticsSummary);
router.post('/cache/clear', analyticsController.clearAnalyticsCache);

module.exports = router;