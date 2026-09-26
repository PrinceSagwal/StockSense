import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { generateOTP, verifyHashedOTP } from '../utils/generateOTP.js';
import { sendEmail, otpEmailTemplate } from '../utils/sendEmail.js';
import { sendSMS } from '../utils/sendSMS.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';
import { sendPhoneVerification, verifyPhoneCode } from '../utils/twilioVerify.js';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role || 'warehouse_staff',
        phone: phone || ''
    });

    generateToken(res, user._id, user.role);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone
        }
    });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
    }

    generateToken(res, user._id, user.role);

    res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone
        }
    });
});

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    res.cookie('stocksense_token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// @desc    Forgot password / send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const { otp, hashedOtp, otpExpiry } = await generateOTP();
    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send Email
    await sendEmail({
        to: user.email,
        subject: 'Your StockSense Password Reset OTP',
        html: otpEmailTemplate(otp, user.name),
        text: `Your StockSense OTP code is: ${otp}`
    });

    // Send SMS if phone is available
    if (user.phone) {
        await sendSMS(user.phone, `Your StockSense password reset code is ${otp}. Valid for 10 minutes.`);
    }

    console.log(`[AUTH] Password Reset OTP for ${user.email}: ${otp}`);

    res.status(200).json({
        success: true,
        message: 'OTP sent to your registered email and phone number'
    });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp || !user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'No pending OTP verification found' });
    }

    if (new Date() > user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    }

    const isValid = await verifyHashedOTP(otp, user.otp);
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
    });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide email, OTP, and new password' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp || !user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'No pending reset request' });
    }

    if (new Date() > user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const isValid = await verifyHashedOTP(otp, user.otp);
    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in.'
    });
});

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;

    if (req.file) {
        if (req.file.path) {
            user.avatar = req.file.path;
        } else if (req.file.buffer) {
            // Data URI fallback
            const base64 = req.file.buffer.toString('base64');
            user.avatar = `data:${req.file.mimetype};base64,${base64}`;
        }
    }

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            phone: updatedUser.phone
        }
    });
});

// @desc    Send Phone OTP via Twilio Verify
// @route   POST /api/auth/phone/send-otp
// @access  Public
export const sendPhoneOTP = asyncHandler(async (req, res) => {
    let { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ success: false, message: 'Please provide phone number' });
    }

    // Normalize phone
    phone = phone.trim().replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }

    let user = await User.findOne({ phone });
    const { otp, hashedOtp, otpExpiry } = await generateOTP();

    if (user) {
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();
    }

    const result = await sendPhoneVerification(phone, otp);

    res.status(200).json({
        success: true,
        message: `Verification code sent to ${phone}`,
        method: result.method
    });
});

// @desc    Verify Phone OTP & Login via Twilio Verify
// @route   POST /api/auth/phone/verify-otp
// @access  Public
export const verifyPhoneOTP = asyncHandler(async (req, res) => {
    let { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ success: false, message: 'Please provide phone number and OTP' });
    }

    phone = phone.trim().replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
        phone = '+' + phone;
    }

    let user = await User.findOne({ phone });
    const verification = await verifyPhoneCode(
        phone,
        otp,
        user?.otp || null,
        user?.otpExpiry || null
    );

    if (!verification.success || !verification.approved) {
        return res.status(400).json({
            success: false,
            message: verification.message || 'Invalid or expired verification code'
        });
    }

    // Auto-provision user if new phone number
    if (!user) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        user = await User.create({
            name: `User ${phone.slice(-4)}`,
            email: `phone_${cleanPhone}@stocksense.internal`,
            password: `pass_${randomSuffix}_${Date.now()}`,
            phone,
            role: 'warehouse_staff'
        });
    } else {
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
    }

    if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    generateToken(res, user._id, user.role);

    res.status(200).json({
        success: true,
        message: 'Twilio phone verification successful. Logged in!',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone
        }
    });
});
