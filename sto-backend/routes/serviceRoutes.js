const express = require('express');
const serviceRoutes = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');

serviceRoutes.use(auth);

serviceRoutes.get('/', serviceController.getServices);


serviceRoutes.post('/add', serviceController.createService);


serviceRoutes.put('/:id', serviceController.updateService);


serviceRoutes.delete('/:id', serviceController.deleteService);

module.exports = serviceRoutes;