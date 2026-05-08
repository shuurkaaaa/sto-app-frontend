const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const { validateCustomerData, validateNote } = require('../middlewares/validateCustomer');

// --- Базові операції з клієнтами ---
router.get('/', controller.getAllCustomers);
router.post('/', validateCustomerData, controller.createCustomer);
router.delete('/:id', controller.deleteCustomer);
router.patch('/:id/archive', controller.toggleArchive);

// --- Робота з автомобілями клієнта ---
router.post('/:id/car', controller.addCar);
router.delete('/:id/car/:carId', controller.deleteCar);

// --- Робота з нотатками та комунікацією ---
router.patch('/:id/notes', controller.updateCustomerNotes);
router.post('/:id/communication', validateNote, controller.addCommunicationNote);
router.delete('/:id/note/:noteId', controller.deleteNote);

module.exports = router;