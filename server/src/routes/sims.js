const express = require('express');
const router = express.Router();
const simsController = require('../controllers/sims');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', simsController.getAll);
router.get('/:id', simsController.getById);
router.post('/', authorize(['ADMIN', 'IT_SUPPORT']), simsController.create);
router.put('/:id', authorize(['ADMIN', 'IT_SUPPORT']), simsController.update);
router.delete('/:id', authorize(['ADMIN', 'IT_SUPPORT']), simsController.delete);

module.exports = router;
