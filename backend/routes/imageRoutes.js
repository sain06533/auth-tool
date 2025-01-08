const express = require('express');
const { serveImage } = require('../controllers/imageController');

const router = express.Router();

// Serve user image
router.get('/user-image/:username', serveImage);

module.exports = router;
