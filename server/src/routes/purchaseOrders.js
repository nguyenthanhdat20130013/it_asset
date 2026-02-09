const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseOrders');

// Categories
router.get('/categories', controller.getAllCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

// Purchase Orders
router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
