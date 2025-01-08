const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: Buffer, required: true }, // Store the image as a buffer
  imageHash: { type: String, required: true }, // Store the hash of the image
  points: { type: Array, required: true }, // Store the selected points
});

module.exports = mongoose.model('User', userSchema);
