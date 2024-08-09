const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Update Bio
router.put('/update-bio', async (req, res) => {
  const { userId, bio } = req.body;
  try {
    const user = await User.findOneAndUpdate({ userId }, { bio }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Bio updated successfully', bio: user.bio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile Picture
router.put('/update-profile-picture', async (req, res) => {
  const { userId, profilePicture } = req.body; // profilePicture should be a URL or file path
  try {
    const user = await User.findOneAndUpdate({ userId }, { profilePicture }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by userId (already exists from previous code)
router.get('/search', async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findOne({ userId }).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
