const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://sain06533:pqeeWCV3aoWK5K9R@storage1.jmnqm.mongodb.net/Storage1',
      { dbName: 'Storage1' } // Specify the database name here
    );
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
