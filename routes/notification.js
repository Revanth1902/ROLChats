const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();

// Send Notification
router.post('/send', async (req, res) => {
  const { userId, message } = req.body;
  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    // Emit a socket event for real-time notification updates
    req.io.to(userId).emit('receiveNotification', notification);
    res.status(201).json({ message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Notifications
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const notifications = await Notification.find({ userId }).sort('-timestamp');
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Notifications as Read
router.post('/read', async (req, res) => {
  const { userId, notificationIds } = req.body;
  try {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { read: true }
    );
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
