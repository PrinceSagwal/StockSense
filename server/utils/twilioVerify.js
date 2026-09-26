import twilio from 'twilio';
import bcryptjs from 'bcryptjs';
import OtpToken from '../models/OtpToken.js';

export const sendPhoneVerification = async (phone, fallbackOtp = null) => {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID
  } = process.env;

  const hasTwilioCreds =
    TWILIO_ACCOUNT_SID &&
    !TWILIO_ACCOUNT_SID.includes('ACxxxx') &&
    TWILIO_AUTH_TOKEN &&
    !TWILIO_AUTH_TOKEN.includes('your_');

  // If Twilio Verify Service SID is explicitly provided and valid, try Twilio Verify API
  if (hasTwilioCreds && TWILIO_VERIFY_SERVICE_SID && !TWILIO_VERIFY_SERVICE_SID.includes('VAxxxx')) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      const verification = await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: 'sms' });

      return {
        success: true,
        method: 'twilio_verify',
        status: verification.status
      };
    } catch (err) {
      console.warn('⚠️ Twilio Verify API failed, using native StockSense OTP:', err.message);
    }
  }

  // Native StockSense OTP Engine (No Twilio required)
  if (fallbackOtp) {
    const hashedOtp = await bcryptjs.hash(fallbackOtp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpToken.findOneAndUpdate(
      { identifier: phone },
      { hashedOtp, plainOtp: fallbackOtp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`\n╔═══════════════════════════════════════════════════════╗`);
    console.log(`║  📱 [StockSense OTP] Verification Code                ║`);
    console.log(`║  Recipient : ${phone.padEnd(38)} ║`);
    console.log(`║  Code      : ${fallbackOtp.padEnd(38)} ║`);
    console.log(`║  Valid for : 10 minutes (Auto-expires)                ║`);
    console.log(`╚═══════════════════════════════════════════════════════╝\n`);

    return {
      success: true,
      method: 'native_otp',
      otp: fallbackOtp
    };
  }

  return { success: false, error: 'Could not generate verification code' };
};

export const verifyPhoneCode = async (phone, code, storedHashedOtp = null, otpExpiry = null) => {
  // 1. Hackathon / Demo bypass code
  if (code === '123456') {
    return { success: true, approved: true };
  }

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID
  } = process.env;

  const hasTwilioCreds =
    TWILIO_ACCOUNT_SID &&
    !TWILIO_ACCOUNT_SID.includes('ACxxxx') &&
    TWILIO_AUTH_TOKEN &&
    !TWILIO_AUTH_TOKEN.includes('your_');

  // Try Twilio Verify if configured
  if (hasTwilioCreds && TWILIO_VERIFY_SERVICE_SID && !TWILIO_VERIFY_SERVICE_SID.includes('VAxxxx')) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      const check = await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });

      if (check.status === 'approved') {
        return { success: true, approved: true };
      }
    } catch (err) {
      console.warn('Twilio Verify check failed, checking native OTP token:', err.message);
    }
  }

  // 2. Check native OtpToken collection
  try {
    const otpRecord = await OtpToken.findOne({ identifier: phone });
    if (otpRecord) {
      if (new Date() > new Date(otpRecord.expiresAt)) {
        await OtpToken.deleteOne({ _id: otpRecord._id });
        return { success: false, message: 'Verification code has expired. Please request a new one.' };
      }

      const isMatch = (otpRecord.plainOtp && otpRecord.plainOtp === code) ||
                      (await bcryptjs.compare(code, otpRecord.hashedOtp));

      if (isMatch) {
        await OtpToken.deleteOne({ _id: otpRecord._id });
        return { success: true, approved: true };
      }
    }
  } catch (err) {
    console.error('Error querying OtpToken:', err.message);
  }

  // 3. Fallback verification using user record's stored hashed OTP (if any)
  if (storedHashedOtp && otpExpiry) {
    if (new Date() > new Date(otpExpiry)) {
      return { success: false, message: 'Verification code has expired' };
    }
    const isValid = await bcryptjs.compare(code, storedHashedOtp);
    if (isValid) {
      return { success: true, approved: true };
    }
  }

  return { success: false, message: 'Invalid verification code. Please check and try again.' };
};

export default { sendPhoneVerification, verifyPhoneCode };
