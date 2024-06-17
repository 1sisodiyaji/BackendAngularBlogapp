const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  image: {
    type: String,
    default: 'default.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  about: {
    type: String,
    trim: true,
    default: "I'm a new user",
  },
});
 
UserSchema.index({ username: 1, email: 1 }, { unique: true });  

const User = mongoose.model('User', UserSchema);

module.exports = User;
