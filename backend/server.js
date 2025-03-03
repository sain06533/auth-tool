const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file uploads (store images in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [{ filename: String, data: Buffer, contentType: String }], // Store 4 images
  selectedImage: String, // Image chosen for point verification
  points: [{ x: Number, y: Number }], // User's selected points
  polynomial: [Number], // Generated polynomial coefficients
});

const User = mongoose.model('User', userSchema);

/**
 * 🔹 Helper Function: Generate a polynomial from selected points
 */
function generatePolynomialFromPoints(points) {
  const degree = points.length - 1;
  const coefficients = Array(degree + 1).fill(0);

  for (let i = 0; i <= degree; i++) {
    const { x: xi, y: yi } = points[i];
    let basisCoefficients = Array(degree + 1).fill(0);
    basisCoefficients[0] = 1;

    for (let j = 0; j <= degree; j++) {
      if (j !== i) {
        const { x: xj } = points[j];
        const scale = 1 / (xi - xj);

        for (let k = degree; k >= 0; k--) {
          basisCoefficients[k] = (basisCoefficients[k] || 0) * -xj * scale +
            (basisCoefficients[k - 1] || 0) * scale;
        }
      }
    }

    for (let k = 0; k <= degree; k++) {
      coefficients[k] += yi * (basisCoefficients[k] || 0);
    }
  }

  return coefficients;
}




/**
 * 🔹 Helper Function: Solve a system of linear equations using Gaussian elimination
 */
function gaussianElimination(matrix, results) {
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    const factor = matrix[i][i];
    for (let j = 0; j < n; j++) {
      matrix[i][j] /= factor;
    }
    results[i] /= factor;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const multiplier = matrix[k][i];
      for (let j = 0; j < n; j++) {
        matrix[k][j] -= multiplier * matrix[i][j];
      }
      results[k] -= multiplier * results[i];
    }
  }
  return results;
}

/**
 * 🔹 Helper Function: Evaluate a polynomial at a given x
 */
function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((sum, coef, index) => sum + coef * Math.pow(x, index), 0);
}

app.get("/api/auth/getImages/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user || !user.images || user.images.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }

    // Convert images to Base64 URL format
    const images = user.images.map((img) => ({
      filename: img.filename, // Use original filename
      data: `data:${img.contentType};base64,${img.data.toString("base64")}`, 
      contentType: img.contentType,
    }));
    
    res.json(images);
  } catch (error) {
    console.error("Error retrieving images:", error);
    res.status(500).json({ message: "Server error" });
  }
});

function verifyPolynomial(points, polynomial, tolerance = 50) {
  if (!points || !polynomial) return false;

  for (let point of points) {
      let expectedY = 0;
      for (let i = 0; i < polynomial.length; i++) {
          expectedY += polynomial[i] * Math.pow(point.x, i);
      }

      if (Math.abs(expectedY - point.y) > tolerance) {
          return false; // Point does not match within tolerance
      }
  }
  return true; // All points matched within tolerance
}

/**
 * 🔹 Registration Route - Upload 4 Images, Select 1 for Points
 */
app.post('/api/auth/register', upload.array('images', 4), async (req, res) => {
  try {
    const { username, password, selectedImage, points } = req.body;
    let parsedPoints = JSON.parse(points);

    if (!parsedPoints || parsedPoints.length < 2) {
      return res.status(400).json({ message: 'Invalid points for polynomial generation.' });
    }

    // 🔹 Generate polynomial without scale factor
    const polynomialCoefficients = generatePolynomialFromPoints(parsedPoints);
    if (!polynomialCoefficients || polynomialCoefficients.some(isNaN)) {
      return res.status(400).json({ message: 'Failed to generate polynomial. Please reselect points.' });
    }

    const imageFiles = req.files.map((file) => ({
      filename: file.originalname,
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const newUser = new User({
      username,
      password: await bcrypt.hash(password, 10),
      images: imageFiles,
      selectedImage,
      points: parsedPoints,
      polynomial: polynomialCoefficients
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});







/**
 * 🔹 Login Step 1 - Validate Password
 */
app.post('/api/auth/login-step1', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

    // Proceed to Step 2 (send images for selection)
    res.status(200).json({ message: 'Password validated', images: user.images.map(img => img.filename) });

  } catch (error) {
    console.error('Login Step 1 Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * 🔹 Login Step 2 - User Selects Correct Image
 */
app.post('/api/auth/login-step2', async (req, res) => {
  try {
    const { username, selectedImage } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log("Stored selectedImage in DB:", user.selectedImage);
    console.log("Received selectedImage from frontend:", selectedImage);

    if (user.selectedImage !== selectedImage) {
      return res.status(401).json({ message: 'Incorrect image selected' });
    }
    if (user.selectedImage === selectedImage) {
      console.log("Received selectedImage from frontend:", selectedImage);
    }
    res.status(200).json({ message: 'Correct image selected, proceed to point verification' });

  } catch (error) {
    console.error('Login Step 2 Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

/**
 * 🔹 Login Step 3 - Verify Points on Selected Image
 */
app.post('/api/auth/login-step3', async (req, res) => {
  try {
    const { username, points } = req.body;
    let parsedPoints = JSON.parse(points);

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.polynomial) {
      return res.status(500).json({ message: 'Polynomial missing in database' });
    }

    // 🔹 Verify points using polynomial with a tolerance
    const tolerance = 50; // Adjust as needed
    const isValid = verifyPolynomial(parsedPoints, user.polynomial, tolerance);

    if (isValid) {
      return res.status(200).json({ message: 'Authentication successful' });
    } else {
      return res.status(401).json({ message: 'Point verification failed' });
    }

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});








// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
