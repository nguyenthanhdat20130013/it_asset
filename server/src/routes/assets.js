const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assets');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', assetsController.getAll);
router.get('/:id', assetsController.getById);
router.post('/', authorize(['ADMIN', 'IT_SUPPORT']), assetsController.create);
router.put('/:id', authorize(['ADMIN', 'IT_SUPPORT']), assetsController.update);
router.delete('/:id', authorize(['ADMIN', 'IT_SUPPORT']), assetsController.delete);

// Assignment
router.post('/:id/assign', authorize(['ADMIN', 'IT_SUPPORT']), assetsController.assign);
router.post('/:id/return', authorize(['ADMIN', 'IT_SUPPORT']), assetsController.returnAsset);

module.exports = router;
