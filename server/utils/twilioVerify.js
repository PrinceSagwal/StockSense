import twilio from 'twilio';
import { sendSMS } from './sendSMS.js';

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

  // If Twilio Verify Service SID is provided, use Twilio Verify API
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
      console.warn('Twilio Verify API error, falling back to SMS/Mock:', err.message);
    }
  }

  // Fallback: Send SMS with the generated OTP code
  if (fallbackOtp) {
    const message = `Your StockSense login verification code is ${fallbackOtp}. Valid for 10 minutes.`;
    await sendSMS(phone, message);
    console.log(`\n========================================`);
    console.log(`📱 [Twilio Verify] OTP for ${phone}: ${fallbackOtp}`);
    console.log(`========================================\n`);
    return {
      success: true,
      method: 'sms_fallback'
    };
  }

  return { success: false, error: 'Could not send verification code' };
};

export const verifyPhoneCode = async (phone, code, storedHashedOtp = null, otpExpiry = null) => {
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

  // If Twilio Verify Service is configured, verify via Twilio API
  if (hasTwilioCreds && TWILIO_VERIFY_SERVICE_SID && !TWILIO_VERIFY_SERVICE_SID.includes('VAxxxx')) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      const check = await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: phone, code });

      if (check.status === 'approved') {
        return { success: true, approved: true };
      } else {
        return { success: false, message: 'Invalid or expired verification code' };
      }
    } catch (err) {
      console.warn('Twilio Verify check failed, checking fallback:', err.message);
    }
  }

  // Fallback verification using stored hashed OTP
  if (storedHashedOtp && otpExpiry) {
    if (new Date() > new Date(otpExpiry)) {
      return { success: false, message: 'Verification code has expired' };
    }
    const bcryptjs = (await import('bcryptjs')).default;
    const isValid = await bcryptjs.compare(code, storedHashedOtp);
    if (isValid) {
      return { success: true, approved: true };
    }
  }

  return { success: false, message: 'Invalid verification code' };
};

export default { sendPhoneVerification, verifyPhoneCode };
