const express = require('express');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Import Notification model
const router = express.Router();

// Send Friend Request
router.post('/send', async (req, res) => {
  const { fromUserId, toUserId } = req.body;
  try {
    const fromUser = await User.findOne({ userId: fromUserId });
    const toUser = await User.findOne({ userId: toUserId });

    if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found' });

    const existingRequest = await FriendRequest.findOne({ fromUser: fromUser._id, toUser: toUser._id });
    if (existingRequest) return res.status(400).json({ message: 'Friend request already sent' });

    const request = new FriendRequest({ fromUser: fromUser._id, toUser: toUser._id });
    await request.save();

    toUser.friendRequests.push(fromUser._id);
    await toUser.save();

    // Send notification to the recipient
    const notification = new Notification({
      userId: toUser._id,
      message: `${fromUserId} sent you a friend request`
    });
    await notification.save();

    // Emit a socket event for real-time notification updates
    req.io.to(toUser._id.toString()).emit('receiveNotification', notification);

    res.status(201).json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
