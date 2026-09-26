import mongoose from 'mongoose';

const otpTokenSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true
    },
    hashedOtp: {
      type: String,
      required: true
    },
    plainOtp: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: automatically deletes expired documents
    }
  },
  { timestamps: true }
);

const OtpToken = mongoose.model('OtpToken', otpTokenSchema);
export default OtpToken;
