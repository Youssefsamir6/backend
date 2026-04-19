const express = require('express');
const router = express.Router();
const { recognition } = require('../controllers/ai.controller');

router.post('/recognition', recognition);

module.exports = router;

