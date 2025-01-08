const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, password, points } = req.body;
    const imageBuffer = req.file.buffer;

    // Generate image hash
    const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const user = new User({
      username,
      password: hashedPassword,
      image: imageBuffer,
      imageHash,
      points: JSON.parse(points),
    });

    await user.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { username, password, points } = req.body;
    const uploadedImageBuffer = req.file.buffer;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

    // Verify image hash
    const uploadedImageHash = crypto.createHash('sha256').update(uploadedImageBuffer).digest('hex');
    if (uploadedImageHash !== user.imageHash)
      return res.status(401).json({ message: 'Image verification failed' });

    // Verify points with tolerance
    const registeredPoints = user.points;
    const loginPoints = JSON.parse(points);
    const isValidPoints = registeredPoints.every((registeredPoint, index) => {
      const tolerance = 0.05; // Tolerance for point comparison
      const isValidX = Math.abs(registeredPoint.x - loginPoints[index].x) <= tolerance;
      const isValidY = Math.abs(registeredPoint.y - loginPoints[index].y) <= tolerance;
      return isValidX && isValidY;
    });

    if (!isValidPoints) return res.status(401).json({ message: 'Point verification failed' });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { registerUser, loginUser };
