const express = require('express');
const router = express.Router();
const EDIController = require('../Controllers/EDIController');

router.post('/send', EDIController.send);

module.exports = router;
