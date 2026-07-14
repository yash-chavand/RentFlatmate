const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporterInstance = null;

async function getTransporter() {
  if (transporterInstance) return transporterInstance;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    logger.info(`SMTP configuration loaded: ${host}:${port}`);
    transporterInstance = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass }
    });
  } else {
    logger.warn('SMTP configuration missing. Generating temporary Ethereal test email account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info(`Ethereal test account created: User=${testAccount.user}`);
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      transporterInstance._ethereal = true;
    } catch (err) {
      logger.error('Failed to create Ethereal test account. Falling back to log-only email sender.', err);
    }
  }

  return transporterInstance;
}

/**
 * Sends structured email notifications for interest requests and updates.
 * If Ethereal test account is used, logs a link to preview the message.
 */
async function sendEmail({ to, subject, text }) {
  const transporter = await getTransporter();

  if (!transporter) {
    logger.info(`
========================================================================
📧 OUTGOING EMAIL (LOG FALLBACK)
------------------------------------------------------------------------
TO:      ${to}
SUBJECT: ${subject}
BODY:
${text}
========================================================================
    `);
    return { success: true, messageId: `log-${Date.now()}` };
  }

  try {
    const fromAddress = process.env.SMTP_FROM || '"RentSync Notifications" <no-reply@rentsync.local>';
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text
    });

    logger.info(`Email sent successfully. Message ID: ${info.messageId}`);
    
    if (transporter._ethereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logger.info(`🔗 Ethereal Test Email Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendEmail,
};
