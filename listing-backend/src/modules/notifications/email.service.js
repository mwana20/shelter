import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  const { API_KEY_PUBLIC, API_KEY_PRIVATE, FROM_EMAIL, FROM_NAME } = env.MAILJET;
  if (!API_KEY_PUBLIC || !API_KEY_PRIVATE) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Mailjet API credentials are not configured.');
    }
    logger.info(`[DEV EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return { simulated: true, to, subject };
  }

  if (!FROM_EMAIL || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(FROM_EMAIL)) {
    throw new Error('EMAIL_FROM must be a validated sender email address in Mailjet.');
  }

  try {
    const credentials = Buffer.from(`${API_KEY_PUBLIC}:${API_KEY_PRIVATE}`).toString('base64');
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Messages: [{
          From: {
            Email: FROM_EMAIL,
            Name: FROM_NAME
          },
          To: [{ Email: to }],
          Subject: subject,
          HTMLPart: html,
          TextPart: text || html.replace(/<[^>]+>/g, '')
        }]
      }),
      signal: AbortSignal.timeout(30_000)
    });

    const result = await response.json().catch(() => null);
    const message = result?.Messages?.[0];
    if (!response.ok || message?.Status !== 'success') {
      const details = message?.Errors
        ?.map((error) => error.ErrorMessage)
        .filter(Boolean)
        .join('; ');
      throw new Error(`Mailjet request failed (${response.status})${details ? `: ${details}` : '.'}`);
    }

    logger.info(`Email accepted by Mailjet for ${to}.`);
    return result;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};
