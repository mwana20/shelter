import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter = null;

const hasPlaceholderCredentials = [env.SMTP.USER, env.SMTP.PASS].some((value) =>
  /^(your[_-]|change[_-]?me|replace[_-]?me|placeholder)/i.test(value)
);

if (env.SMTP.USER && env.SMTP.PASS && !hasPlaceholderCredentials) {
  transporter = nodemailer.createTransport({
    host: env.SMTP.HOST,
    port: env.SMTP.PORT,
    secure: env.SMTP.SECURE,
    auth: {
      user: env.SMTP.USER,
      pass: env.SMTP.PASS
    }
  });
}

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: env.SMTP.FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, '')
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  } else {
    // Development fallback logger (no SMTP configured yet)
    logger.info(`[DEV EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return { simulated: true, to, subject };
  }
};
