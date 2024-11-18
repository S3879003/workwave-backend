const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "", required: false },
  accessLevel: { type: Number, default: 1, required: true },
  profilePicture: { type: String, required: false }, // URL for the profile picture
});

module.exports = mongoose.model('User', UserSchema);
