const express = require('express');
const router = express.Router();
const OrdersController = require('../Controllers/OrdersController');

router.get('/', OrdersController.list);
router.post('/', OrdersController.create);
router.delete('/:id', OrdersController.remove);
router.patch('/:id/status', OrdersController.updateStatus);

module.exports = router;
