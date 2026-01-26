const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', backupController.backup);
router.post('/restore', backupController.restore);

module.exports = router;
