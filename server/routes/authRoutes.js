import express from 'express';
import {
    signup,
    login,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getMe,
    updateProfile,
    sendPhoneOTP,
    verifyPhoneOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);

// Twilio Verify Phone Login Flow
router.post('/phone/send-otp', authLimiter, sendPhoneOTP);
router.post('/phone/verify-otp', authLimiter, verifyPhoneOTP);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('avatar'), updateProfile);

export default router;
