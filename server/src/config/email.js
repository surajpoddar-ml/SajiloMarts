export const emailConfig = {
  fromAddress: process.env.EMAIL_FROM || 'noreply@sajilomarts.com',
  fromName: 'SajiloMarts Support',
  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 2525,
};
