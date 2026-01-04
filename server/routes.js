const express = require('express');
const router = express.Router();
const controller = require('./controller.js');

router.get('/spotifyLogin', controller.spotifyLogin);

module.exports = router;
