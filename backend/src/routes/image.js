const express = require('express');
const Image = require('../models/Image');
const router = express.Router();

// Add image metadata
router.post('/add-image', async (req, res) => {
  const { imageId, scale, equationConstants } = req.body;

  try {
    const existingImage = await Image.findOne({ imageId });
    if (existingImage) {
      return res.status(400).json({ message: 'Image already exists' });
    }

    const image = new Image({ imageId, scale, equationConstants });
    await image.save();
    res.status(201).json({ message: 'Image metadata added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Validate image authentication
router.post('/validate-image', async (req, res) => {
  const { imageId, points } = req.body;

  try {
    const image = await Image.findOne({ imageId });
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const { equationConstants, scale } = image;

    if (points.length !== equationConstants.length) {
      return res.status(400).json({ message: 'Invalid number of points' });
    }

    let result = 0;
    console.log("Starting validation:");
    for (let i = 0; i < points.length; i++) {
      const { x, y } = points[i];
      const { a, b } = equationConstants[i];

      const scaledX = x / scale.x;
      const scaledY = y / scale.y;

      const contribution = a * scaledX + b * scaledY;
      console.log(`Point ${i + 1}: (${x}, ${y}), Scaled: (${scaledX}, ${scaledY}), Contribution: ${contribution}`);

      result += contribution;
    }

    // Normalize by the number of points
    result = result / points.length;

    console.log(`Final Normalized Result: ${result}`);

    if (Math.abs(result - 1) < 0.01) {
      return res.json({ success: true, message: 'Authentication successful' });
    } else {
      return res.json({ success: false, message: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

  
  

module.exports = router;
