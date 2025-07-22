const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to check chess.com ID status
router.post('/auth/check-chess-id', authController.checkChessId);

// Route to handle sending an OTP
router.post('/auth/send-otp', authController.sendOtp);

// Route to verify OTP and set the password
router.post('/auth/verify-set-password', authController.verifyAndSetPassword);

// Route for login with password
router.post('/auth/login', authController.login);

module.exports = router;