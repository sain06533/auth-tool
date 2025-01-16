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

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageHash: { type: String, required: true },
  points: { type: Array, required: true },
});
const User = mongoose.model('User', userSchema);

// Routes
// Registration Route

// Generate a polynomial that passes through all the given points
function generatePolynomial(points) {
    const n = points.length;
    const matrix = [];
    const results = [];
  
    points.forEach(({ x, y }) => {
      const row = [];
      for (let i = 0; i < n; i++) {
        row.push(Math.pow(x, i)); // x^0, x^1, x^2, ...
      }
      matrix.push(row);
      results.push(y);
    });
  
    // Solve the system of linear equations using Gaussian elimination
    return gaussianElimination(matrix, results);
  }
  
  // Solve a system of linear equations using Gaussian elimination
  function gaussianElimination(matrix, results) {
    const n = matrix.length;
  
    for (let i = 0; i < n; i++) {
      // Make the diagonal element 1
      const factor = matrix[i][i];
      for (let j = 0; j < n; j++) {
        matrix[i][j] /= factor;
      }
      results[i] /= factor;
  
      // Make the other elements in this column 0
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
  
  // Evaluate the polynomial at a given x
  function evaluatePolynomial(coefficients, x) {
    return coefficients.reduce((sum, coef, index) => sum + coef * Math.pow(x, index), 0);
  }
  
// Helper function to generate polynomial coefficients using Lagrange Interpolation
function generatePolynomialFromPoints(points) {
    const degree = points.length - 1;
    const coefficients = Array(degree + 1).fill(0);
  
    for (let i = 0; i <= degree; i++) {
      const { x: xi, y: yi } = points[i];
  
      // Compute Lagrange basis polynomial for each point
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
  
      // Scale basis polynomial by yi and add to coefficients
      for (let k = 0; k <= degree; k++) {
        coefficients[k] += yi * (basisCoefficients[k] || 0);
      }
    }
  
    return coefficients;
  }
  
  // Registration Route
  app.post('/api/auth/register', upload.single('image'), async (req, res) => {
    try {
      const { username, password, points } = req.body;
      const uploadedImageBuffer = req.file.buffer;
  
      // Generate image hash
      const imageHash = crypto.createHash('sha256').update(uploadedImageBuffer).digest('hex');
  
      // Parse points from the request
      const parsedPoints = JSON.parse(points);
  
      // Generate polynomial coefficients
      const coefficients = generatePolynomial(parsedPoints);
      console.log('Generated Coefficients:', coefficients);
  
      // Create a new user object
      const user = new User({
        username,
        password: await bcrypt.hash(password, 10),
        imageHash,
        points: coefficients, // Assign coefficients to the points field
      });
  
      console.log('Saving User:', user);
  
      // Save the user to the database
      await user.save();
  
      res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(400).json({ message: 'Registration failed', error: error.message });
    }
  });
  
  
  
  
  
// Login Route
// Helper function to evaluate a polynomial at a given x
function evaluatePolynomial(coefficients, x) {
    if (!coefficients || !Array.isArray(coefficients)) {
      console.error('Invalid coefficients:', coefficients); // Debugging
      throw new Error('Invalid coefficients provided to evaluatePolynomial.');
    }
  
    console.log('Evaluating Polynomial with coefficients:', coefficients, 'and x:', x); // Debugging
  
    return coefficients.reduce((sum, coef, index) => sum + coef * Math.pow(x, index), 0);
  }
  
  
// Define TOLERANCE at the top of the file
const TOLERANCE = 50; // Adjust tolerance value to suit user input precision

// Login Route
app.post('/api/auth/login', upload.single('image'), async (req, res) => {
  try {
    const { username, password, points } = req.body;
    const uploadedImageBuffer = req.file.buffer;

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

    // Verify image hash
    const uploadedImageHash = crypto.createHash('sha256').update(uploadedImageBuffer).digest('hex');
    if (uploadedImageHash !== user.imageHash) {
      return res.status(401).json({ message: 'Image verification failed' });
    }

    // Retrieve polynomial coefficients
    const coefficients = user.points;
    console.log('Retrieved Coefficients:', coefficients);

    if (!coefficients || coefficients.length === 0) {
      return res.status(400).json({ message: 'User data corrupted. Missing polynomial coefficients.' });
    }

    // Verify points with tolerance
    const parsedPoints = JSON.parse(points);
    console.log('Received Points:', parsedPoints);

    const isValidPoints = parsedPoints.every((point) => {
      const yCalculated = evaluatePolynomial(coefficients, point.x);
      console.log(
        `Evaluating Polynomial with coefficients: ${coefficients} and x: ${point.x} -> Calculated y: ${yCalculated}, Expected y: ${point.y}`
      );

      const isWithinTolerance = Math.abs(yCalculated - point.y) <= TOLERANCE;
      if (!isWithinTolerance) {
        console.log(`Point verification failed for x: ${point.x}, y: ${point.y}, calculated y: ${yCalculated}`);
      }
      return isWithinTolerance;
    });

    if (!isValidPoints) return res.status(401).json({ message: 'Point verification failed' });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});


  
  
  
  

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
