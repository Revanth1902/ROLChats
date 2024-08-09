const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Import Notification model
const router = express.Router();

// Send Message
router.post('/send', async (req, res) => {
  const { fromUserId, toUserId, text } = req.body;
  try {
    const fromUser = await User.findOne({ userId: fromUserId });
    const toUser = await User.findOne({ userId: toUserId });

    if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found' });

    const message = new Message({ from: fromUser._id, to: toUser._id, text });
    await message.save();

    // Send notification to the recipient
    const notification = new Notification({
      userId: toUser._id,
      message: `${fromUserId} sent you a message`
    });
    await notification.save();

    // Emit a socket event for real-time notification updates
    req.io.to(toUser._id.toString()).emit('receiveNotification', notification);

    res.status(200).json({ message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Messages as Read
router.post('/read', async (req, res) => {
  const { userId, messageIds } = req.body;
  try {
    await Message.updateMany(
      { _id: { $in: messageIds }, to: userId },
      { read: true }
    );
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Unread Messages
router.get('/unread', async (req, res) => {
  const { userId } = req.query;
  try {
    const unreadMessages = await Message.find({ to: userId, read: false });
    res.status(200).json(unreadMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
