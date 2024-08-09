const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { userId, password, bio } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userId, password: hashedPassword, bio });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id;  // Save user ID in session
    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Check Authentication
router.get('/me', (req, res) => {
  if (req.session.userId) {
    User.findById(req.session.userId)
      .then(user => res.json(user))
      .catch(err => res.status(500).json({ error: err.message }));
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;
