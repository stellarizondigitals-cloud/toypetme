import { Resend } from 'resend';
import crypto from 'crypto';

const EMAIL_SENDER = process.env.EMAIL_SENDER || 'ToyPetMe <noreply@toypetme.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

// Lazy initialization - only create Resend client when EMAIL_API_KEY is available
function getResendClient(): Resend | null {
  if (!process.env.EMAIL_API_KEY) {
    return null;
  }
  return new Resend(process.env.EMAIL_API_KEY);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, username: string, token: string): Promise<void> {
  const verificationUrl = `${FRONTEND_URL}/verify?token=${token}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { color: #4b5563; line-height: 1.6; margin: 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 14px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Welcome to ToyPetMe!</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>Thanks for signing up! We're excited to have you join our community of virtual pet lovers.</p>
      <p>To start caring for your new pet, please verify your email address by clicking the button below:</p>
      <p style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #6b7280;">
        ${verificationUrl}
      </p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <p>If you didn't create an account with ToyPetMe, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Happy pet caring! 🎮</p>
      <p>The ToyPetMe Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const resend = getResendClient();
    if (!resend) {
      console.log('📧 [DEV MODE] Verification email for', email);
      console.log('🔗 Verification URL:', verificationUrl);
      return;
    }

    await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: 'Verify your ToyPetMe email address',
      html: htmlContent,
    });
    
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, username: string, token: string): Promise<void> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { color: #4b5563; line-height: 1.6; margin: 16px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 6px; }
    .footer { background: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 14px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi ${username},</p>
      <p>We received a request to reset your password for your ToyPetMe account.</p>
      <p>Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #6b7280;">
        ${resetUrl}
      </p>
      <div class="warning">
        <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Important Security Notice</p>
        <p style="margin: 8px 0 0 0; color: #92400e;">This link will expire in 15 minutes for your security.</p>
      </div>
      <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>Stay secure! 🛡️</p>
      <p>The ToyPetMe Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const resend = getResendClient();
    if (!resend) {
      console.log('📧 [DEV MODE] Password reset email for', email);
      console.log('🔗 Reset URL:', resetUrl);
      return;
    }

    await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: 'Reset your ToyPetMe password',
      html: htmlContent,
    });
    
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
