// Express.js setup for password authentication and saving images for multi-factor authentication
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = 5000;

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imagePath: { type: String }, // Path to the saved image for step 2 authentication
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.json());

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// MongoDB connection
mongoose
  .connect('mongodb+srv://sain06533:pqeeWCV3aoWK5K9R@storage1.jmnqm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// 1. User Registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// 2. User Login (Step 1: Password Authentication)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, username: user.username }, 'secret_key', {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// 3. Upload Image for Step 2 Authentication
app.post('/upload-image', upload.single('image'), async (req, res) => {
  const { username } = req.body;
  const imagePath = req.file.path;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      fs.unlinkSync(imagePath); // Delete the uploaded image if the user is not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Save the image path to the user
    user.imagePath = imagePath;
    await user.save();

    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// 4. Serve the saved image for verification
app.get('/user-image/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.imagePath) {
      return res.status(404).json({ message: 'Image not found for the user' });
    }

    res.sendFile(path.resolve(user.imagePath));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching image' });
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
