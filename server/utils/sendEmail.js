import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your@gmail.com') || !process.env.EMAIL_PASS || process.env.EMAIL_PASS.includes('your_16char')) {
      console.log(`[Email Mock] Would send to: ${to} | Subject: ${subject}`);
      if (text) console.log(`[Email Mock Text]: ${text}`);
      return { mock: true, success: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"StockSense" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text || ''}</p>`
    });

    return { success: true, info };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

export const otpEmailTemplate = (otp, name = 'User') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #4F46E5; margin: 0;">StockSense</h1>
    <p style="color: #64748B; margin-top: 4px;">Smart Inventory Management System</p>
  </div>
  <div style="background: #FFFFFF; padding: 24px; border-radius: 8px; border: 1px solid #E2E8F0;">
    <h2 style="color: #0F172A; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #475569;">Hello ${name},</p>
    <p style="color: #475569;">You recently requested to reset your password. Use the following 6-digit OTP code to complete the reset. This code is valid for <strong>10 minutes</strong>.</p>
    <div style="margin: 28px 0; text-align: center;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4F46E5; background: #EEF2FF; padding: 12px 24px; border-radius: 8px; border: 1px dashed #4F46E5;">
        ${otp}
      </span>
    </div>
    <p style="color: #64748B; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
  </div>
</div>
`;

export const lowStockEmailTemplate = (product) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FEF2F2; border-radius: 12px; border: 1px solid #FCA5A5;">
  <h2 style="color: #DC2626; margin-top: 0;">⚠️ Low Stock Alert: ${product.name}</h2>
  <p style="color: #4B5563;">Current stock level has dropped to or below the reorder threshold.</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr><td style="padding: 8px; font-weight: bold;">Product:</td><td>${product.name}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">SKU:</td><td>${product.sku}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Current Stock:</td><td style="color: #DC2626; font-weight: bold;">${product.stockQuantity} ${product.unitOfMeasure}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Reorder Threshold:</td><td>${product.reorderThreshold} ${product.unitOfMeasure}</td></tr>
  </table>
</div>
`;
