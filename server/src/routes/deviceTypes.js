const express = require('express');
const deviceTypesController = require('../controllers/deviceTypes');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

router.get('/', deviceTypesController.getAll);
router.post('/', authorize(['ADMIN']), deviceTypesController.create);
router.delete('/:id', authorize(['ADMIN']), deviceTypesController.delete);

module.exports = router;
