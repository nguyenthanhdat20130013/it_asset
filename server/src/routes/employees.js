const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', employeesController.getAll);
router.get('/:id', employeesController.getById);
router.post('/', authorize(['ADMIN']), employeesController.create);
router.put('/:id', authorize(['ADMIN']), employeesController.update);
router.delete('/:id', authorize(['ADMIN']), employeesController.delete);

module.exports = router;
