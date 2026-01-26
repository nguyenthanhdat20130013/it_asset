const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departments');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', departmentsController.getAll);
router.get('/:id', departmentsController.getById);
router.post('/', authorize(['ADMIN']), departmentsController.create);
router.put('/:id', authorize(['ADMIN']), departmentsController.update);
router.delete('/:id', authorize(['ADMIN']), departmentsController.delete);

module.exports = router;
