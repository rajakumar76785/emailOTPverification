const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const mailSender = require("../mailSender");
async function sendOTPEmail(email, otp){
    try{
         const mailResponse = await mailSender(email,"Verification Email from uniAcco",otp);
         console.log(`OTP for ${email}: ${otp}`);
    }catch(error){
         console.log("error while sending mail ",error);
         throw error;
    }
}


router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email });
    return res.status(200).json({ message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();

    sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || new Date() - new Date(user.otpCreatedAt) > 300000) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const payload = {
        email:user.email,
        id:user._id,
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: "1h",
    });
    res.status(200).json({ message: 'Login successfull', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
