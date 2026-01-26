const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', eventsController.getAll);
router.post('/', authorize(['ADMIN', 'IT_SUPPORT']), eventsController.create);
router.put('/:id', authorize(['ADMIN', 'IT_SUPPORT']), eventsController.update);
router.delete('/:id', authorize(['ADMIN', 'IT_SUPPORT']), eventsController.delete);

module.exports = router;
