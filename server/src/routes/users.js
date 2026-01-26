const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', usersController.getAll);
router.put('/:id/role', usersController.updateRole);
router.delete('/:id', usersController.delete);

module.exports = router;
