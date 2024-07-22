const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
    },
  otp: { 
    type: String,
    required: false 
    },
  otpCreatedAt: { 
    type: Date, 
    required: false 
    }
});

module.exports = mongoose.model('User', UserSchema);
