const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { validateStaff } = require('../middlewares/validateStaff');

// Отримати всіх активних майстрів
router.get('/', staffController.getAllStaff);

// Отримати список звільнених/архівних співробітників
router.get('/archived', staffController.getArchivedStaff);

// Створити нового майстра (з валідацією даних)
router.post('/', validateStaff, staffController.createStaff);

// Оновити дані співробітника
router.put('/:id', validateStaff, staffController.updateStaff);

// Змінити статус (наприклад, "Вільний" на "Зайнятий")
router.put('/:id/status', staffController.updateStaffStatus);

// Видалити (перенести в архів)
router.delete('/:id', staffController.deleteStaff);

// Повернути з архіву на роботу
router.put('/:id/restore', staffController.restoreStaff);

module.exports = router;