const express = require('express');
const multer = require('multer');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register Route
router.post('/register', upload.single('image'), registerUser);

// Login Route
router.post('/login', upload.single('image'), loginUser);

module.exports = router;
