const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', companiesController.getAll);
router.get('/:id', companiesController.getById);
router.post('/', authorize(['ADMIN']), companiesController.create);
router.put('/:id', authorize(['ADMIN']), companiesController.update);
router.delete('/:id', authorize(['ADMIN']), companiesController.delete);

module.exports = router;
