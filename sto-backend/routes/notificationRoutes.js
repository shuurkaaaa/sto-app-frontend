const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const auth = require('../middlewares/authMiddleware');

/**
 * Маршрути системи сповіщень OneWayLogistic
 */

router.use(auth);


router.get('/', getNotifications);


router.post('/', createNotification);



router.delete('/clear-all', clearAllNotifications);


router.delete('/:id', deleteNotification);

module.exports = router;