const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/dashboard', reportsController.getDashboardStats);
router.get('/by-department', reportsController.getAssetByDepartment);

module.exports = router;
