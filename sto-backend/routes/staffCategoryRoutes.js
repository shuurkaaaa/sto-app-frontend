const express = require('express');
const router = express.Router();
const staffCategoryController = require('../controllers/staffCategoryController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', staffCategoryController.getAllStaffCategories);


router.post('/', staffCategoryController.createStaffCategory);


router.delete('/:id', staffCategoryController.deleteStaffCategory);

module.exports = router;