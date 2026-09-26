import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

export const generateOTP = async () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcryptjs.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, hashedOtp, otpExpiry };
};

export const verifyHashedOTP = async (plainOtp, hashedOtp) => {
  if (!plainOtp || !hashedOtp) return false;
  return await bcryptjs.compare(plainOtp, hashedOtp);
};
