const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'blocked'], default: 'pending' }
});

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);
