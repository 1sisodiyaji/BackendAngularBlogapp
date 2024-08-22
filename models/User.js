const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug:{
    type: String,
    required: true,
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
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/dbqq41bpc/image/upload/v1718616387/blog-app/image-1718616385884.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}); 

const User = mongoose.model('User', UserSchema);

module.exports = User;
