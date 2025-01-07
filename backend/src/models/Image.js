const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  imageId: { type: String, required: true, unique: true },
  scale: { x: Number, y: Number }, // Scaling factors
  equationConstants: [
    {
      a: { type: Number },
      b: { type: Number },
    },
  ], // Constants for the equation
});

module.exports = mongoose.model('Image', imageSchema);
