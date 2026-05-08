const express = require('express');
const router = express.Router();
const staffCategoryController = require('../controllers/staffCategoryController');

// Отримати категорії посад (Механіки, Маляри тощо)
router.get('/', staffCategoryController.getAllStaffCategories);

// Створити нову категорію персоналу
router.post('/', staffCategoryController.createStaffCategory);

// Видалити категорію за ID
router.delete('/:id', staffCategoryController.deleteStaffCategory);

module.exports = router;