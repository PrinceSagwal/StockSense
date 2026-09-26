import twilio from 'twilio';

export const sendSMS = async (to, message) => {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

    if (
      !TWILIO_ACCOUNT_SID ||
      TWILIO_ACCOUNT_SID.includes('ACxxxx') ||
      !TWILIO_AUTH_TOKEN ||
      TWILIO_AUTH_TOKEN.includes('your_') ||
      !to
    ) {
      console.log(`[SMS Mock] Would send to: ${to} | Message: ${message}`);
      return { mock: true, success: true };
    }

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const res = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to
    });

    return { success: true, sid: res.sid };
  } catch (error) {
    console.error('SMS sending error:', error.message);
    return { success: false, error: error.message };
  }
};
