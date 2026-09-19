export const emailConfig = {
  fromAddress: process.env.EMAIL_FROM || 'noreply@sastomarts.com',
  fromName: 'SastoMarts Support',
  smtpHost: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 2525,
};
