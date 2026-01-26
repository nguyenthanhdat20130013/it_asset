const express = require('express');
const router = express.Router();
const softwareController = require('../controllers/software');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', softwareController.getAll);
router.post('/', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.create);
router.put('/:id', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.update);
router.delete('/:id', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.delete);

router.post('/:id/licenses', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.addLicense);
router.get('/:id/licenses', softwareController.getLicenses);
router.put('/licenses/:licenseId', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.updateLicense);

router.post('/licenses/:licenseId/assign', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.assignLicense);
router.post('/return/:id', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.returnLicense);
router.delete('/assignments/:assignmentId', authorize(['ADMIN', 'IT_SUPPORT']), softwareController.removeAssignment);

module.exports = router;
