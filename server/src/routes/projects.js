const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', projectsController.getAll);
router.post('/', authorize(['ADMIN', 'IT_SUPPORT']), projectsController.create);
router.put('/:id', authorize(['ADMIN', 'IT_SUPPORT']), projectsController.update);
router.delete('/:id', authorize(['ADMIN', 'IT_SUPPORT']), projectsController.delete);

// Assignment routes
router.post('/:id/assets', projectsController.assignAsset);
router.delete('/:id/assets/:assetId', projectsController.removeAsset);

router.post('/:id/sims', projectsController.assignSim);
router.delete('/:id/sims/:simId', projectsController.removeSim);

module.exports = router;
