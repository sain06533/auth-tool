const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: [{ filename: String, data: Buffer, contentType: String }], // Store 4 images
  selectedImage: String, // Image chosen for point verification
  points: [{ x: Number, y: Number }], // User's selected points
  polynomial: [Number], // Generated polynomial coefficients
});

module.exports = mongoose.model('User', userSchema);
