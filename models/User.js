const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  friendCount: { type: Number, default: 0 },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FriendRequest' }], // Ensure this references FriendRequest IDs
  lastSeen: { type: Date, default: Date.now },
  profilePicture: { type: String, default: 'defaultProfilePic.jpg' },
  online: { type: Boolean, default: false }
});


module.exports = mongoose.model('User', UserSchema);
