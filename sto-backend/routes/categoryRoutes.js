const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Отримати всі категорії складу (наприклад: Фільтри, Мастила)
router.get('/', categoryController.getAllCategories);

// Створити нову категорію
router.post('/', categoryController.createCategory);

// Редагувати категорію за ID
router.put('/:id', categoryController.updateCategory);

// Видалити категорію за ID
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;