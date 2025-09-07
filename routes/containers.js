const express = require('express');
const router = express.Router();
const ContainersController = require('../Controllers/ContainersController');

router.get('/', ContainersController.listByOrder);
router.post('/', ContainersController.create);
router.delete('/:id', ContainersController.remove);

module.exports = router;
