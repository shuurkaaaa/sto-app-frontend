const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);


router.get('/brands', carController.getAllBrands);
router.post('/brands', carController.createBrand);
router.put('/brands/:id', carController.updateBrand);
router.delete('/brands/:id', carController.deleteBrand);



router.post('/models', carController.createModel);
router.put('/models/:id', carController.updateModel);
router.delete('/models/:id', carController.deleteModel);

module.exports = router;