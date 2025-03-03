const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sain06533:pqeeWCV3aoWK5K9R@storage1.jmnqm.mongodb.net/?retryWrites=true&w=majority');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
