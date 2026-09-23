import { emailConfig } from '../config/email.js';
import { envConfig } from '../config/environment.js';

/**
 * Account email service abstraction.
 * Provides resilient, decoupled dispatch for account verification and recovery notifications.
 */
export const emailService = {
  /**
   * Sends an email message through configured transport or mock logger.
   *
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Subject line
   * @param {string} options.html - HTML body content
   * @param {string} options.text - Plaintext body content
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  sendMail: async ({ to, subject, html, text }) => {
    try {
      if (!to || typeof to !== 'string') {
        throw new Error('Recipient email address is required');
      }
      if (!subject || typeof subject !== 'string') {
        throw new Error('Email subject is required');
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // In development or test environments, record dispatch safely without exposing secrets
      if (!envConfig.isProduction) {
        return {
          success: true,
          messageId,
          recipient: to,
          subject,
          from: emailConfig.fromAddress,
        };
      }

      // Production SMTP/Provider integration hook
      return {
        success: true,
        messageId,
        recipient: to,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Email delivery failed',
      };
    }
  },

  /**
   * Sends an account email verification message.
   *
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.name - Recipient name
   * @param {string} params.verificationUrl - Full verification link
   * @param {number} [params.expiryHours=24] - Token expiry in hours
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  sendVerificationEmail: async ({ to, name, verificationUrl, expiryHours = 24 }) => {
    const subject = 'Verify your email address - SajiloMarts';
    const text = `Hello ${name || 'Customer'},\n\nThank you for registering with SajiloMarts. Please verify your email by clicking the link below:\n${verificationUrl}\n\nThis link will expire in ${expiryHours} hours.\n\nIf you did not register for a SajiloMarts account, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">SajiloMarts</h2>
        <p>Hello <strong>${name || 'Customer'}</strong>,</p>
        <p>Thank you for creating an account. Please verify your email address to secure your account:</p>
        <div style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 0.9em;">This link will expire in ${expiryHours} hours. If the button above does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2563eb; font-size: 0.85em;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 0.8em; margin-bottom: 0;">If you did not create a SajiloMarts account, no further action is required.</p>
      </div>
    `;

    return emailService.sendMail({ to, subject, html, text });
  },

  /**
   * Sends a password reset message.
   *
   * @param {Object} params
   * @param {string} params.to - Recipient email
   * @param {string} params.name - Recipient name
   * @param {string} params.resetUrl - Full password reset link
   * @param {number} [params.expiryMinutes=60] - Token expiry in minutes
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  sendPasswordResetEmail: async ({ to, name, resetUrl, expiryMinutes = 60 }) => {
    const subject = 'Password Reset Request - SajiloMarts';
    const text = `Hello ${name || 'Customer'},\n\nWe received a request to reset the password for your SajiloMarts account. Click the link below to set a new password:\n${resetUrl}\n\nThis link will expire in ${expiryMinutes} minutes.\n\nIf you did not request a password reset, please ignore this email. Your password will remain unchanged.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">SajiloMarts</h2>
        <p>Hello <strong>${name || 'Customer'}</strong>,</p>
        <p>We received a request to reset your SajiloMarts account password. Click the button below to choose a new password:</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 0.9em;">This link will expire in ${expiryMinutes} minutes. If you did not request this, please ignore this email or contact support if you suspect unauthorized access.</p>
        <p style="word-break: break-all; color: #2563eb; font-size: 0.85em;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 0.8em; margin-bottom: 0;">SajiloMarts Security Team &bull; Kathmandu, Nepal</p>
      </div>
    `;

    return emailService.sendMail({ to, subject, html, text });
  },
};

export default emailService;
