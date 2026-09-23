/**
 * Email template generators for SajiloMarts transactional notifications.
 */

/**
 * Builds HTML and text verification email templates.
 *
 * @param {Object} params
 * @param {string} params.name - User name
 * @param {string} params.verificationUrl - Action URL
 * @param {number} [params.expiryHours=24] - Token lifetime in hours
 * @returns {{subject: string, html: string, text: string}}
 */
export const buildVerificationEmailTemplate = ({ name, verificationUrl, expiryHours = 24 }) => {
  const customerName = name ? String(name).trim() : 'Valued Customer';
  const subject = 'Verify your email address - SajiloMarts';

  const text = [
    `Hello ${customerName},`,
    '',
    'Thank you for creating an account with SajiloMarts.',
    'Please verify your email address by opening the following link in your browser:',
    '',
    verificationUrl,
    '',
    `This verification link will expire in ${expiryHours} hours.`,
    'If you did not create a SajiloMarts account, no further action is required.',
    '',
    'SajiloMarts Team',
    'Cross-Border E-Commerce Platform | Kathmandu, Nepal',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color:#2563eb;padding:24px 32px;text-align:left;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">SajiloMarts</h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Secure Cross-Border E-Commerce</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:600;">Confirm your email address</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hello <strong>${customerName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                Thank you for joining SajiloMarts. To finish setting up your account and unlock customer features, please verify your email address below:
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verificationUrl}" style="background-color:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;box-shadow:0 2px 4px rgba(37,99,235,0.2);">
                  Verify My Email
                </a>
              </div>
              <p style="margin:24px 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
                This link will securely expire in <strong>${expiryHours} hours</strong>.
              </p>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#64748b;">
                If the button above does not work, copy and paste this link into your web browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;line-height:1.4;word-break:break-all;color:#2563eb;background-color:#f1f5f9;padding:10px 14px;border-radius:6px;border:1px solid #e2e8f0;">
                ${verificationUrl}
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                If you did not create a SajiloMarts account, please disregard this email. Your email will not be activated without verification.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} SajiloMarts. All rights reserved. Kathmandu, Nepal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
};

/**
 * Builds HTML and text password reset email templates.
 *
 * @param {Object} params
 * @param {string} params.name - User name
 * @param {string} params.resetUrl - Password reset action URL
 * @param {number} [params.expiryMinutes=60] - Token lifetime in minutes
 * @returns {{subject: string, html: string, text: string}}
 */
export const buildPasswordResetEmailTemplate = ({ name, resetUrl, expiryMinutes = 60 }) => {
  const customerName = name ? String(name).trim() : 'Valued Customer';
  const subject = 'Password Reset Request - SajiloMarts';

  const text = [
    `Hello ${customerName},`,
    '',
    'We received a request to reset your SajiloMarts account password.',
    'To choose a new password, open the following secure link in your browser:',
    '',
    resetUrl,
    '',
    `This recovery link will expire in ${expiryMinutes} minutes.`,
    'If you did not request a password reset, please ignore this email. Your current password remains secure.',
    '',
    'SajiloMarts Security Team',
    'Kathmandu, Nepal',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color:#0f172a;padding:24px 32px;text-align:left;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">SajiloMarts</h1>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Account Security &amp; Recovery</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:600;">Reset your account password</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">Hello <strong>${customerName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                A request was made to reset the password for your SajiloMarts account. You can reset your password by clicking the button below:
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}" style="background-color:#dc2626;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;box-shadow:0 2px 4px rgba(220,38,38,0.2);">
                  Reset My Password
                </a>
              </div>
              <p style="margin:24px 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
                For security reasons, this link will expire in <strong>${expiryMinutes} minutes</strong> and can only be used once.
              </p>
              <p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#64748b;">
                If the button above does not work, copy and paste this link into your web browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;line-height:1.4;word-break:break-all;color:#dc2626;background-color:#fef2f2;padding:10px 14px;border-radius:6px;border:1px solid #fecaca;">
                ${resetUrl}
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                If you did not request this password reset, your account is safe and no further action is necessary.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                &copy; ${new Date().getFullYear()} SajiloMarts. All rights reserved. Kathmandu, Nepal.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
};

export default {
  buildVerificationEmailTemplate,
  buildPasswordResetEmailTemplate,
};
