const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', tasksController.getAll);
router.post('/', tasksController.create);
router.put('/:id', tasksController.update);
router.delete('/:id', tasksController.delete);

module.exports = router;
