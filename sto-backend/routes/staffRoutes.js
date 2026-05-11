const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { validateStaff } = require('../middlewares/validateStaff');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

router.get('/', staffController.getAllStaff);


router.get('/archived', staffController.getArchivedStaff);


router.post('/', validateStaff, staffController.createStaff);


router.put('/:id', validateStaff, staffController.updateStaff);


router.put('/:id/status', staffController.updateStaffStatus);


router.delete('/:id', staffController.deleteStaff);


router.put('/:id/restore', staffController.restoreStaff);

module.exports = router;