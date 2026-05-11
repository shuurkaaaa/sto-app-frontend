const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', categoryController.getAllCategories);


router.post('/', categoryController.createCategory);


router.put('/:id', categoryController.updateCategory);


router.delete('/:id', categoryController.deleteCategory);

module.exports = router;