const User = require('../models/User');

// Serve the saved image
const serveImage = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user || !user.image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', 'image/png');
    res.send(user.image);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching image' });
  }
};

module.exports = { serveImage };
