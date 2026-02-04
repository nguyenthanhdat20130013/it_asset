const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/health', (req, res) => res.json({ status: 'backup ok' }));
router.get('/', backupController.backup); // Fallback to root
router.get('/export', backupController.backup);
router.post('/import', backupController.restore);
router.post('/restore', backupController.restore); // Fallback

module.exports = router;
