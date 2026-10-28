import { logger } from '../../config/logger.js';
import { sendEmail } from './email.service.js';

export class NotificationService {
  static async notifyPaymentVerified(user, property, payment) {
    logger.info(`Notification: Location unlocked for ${user.email} on property ${property.title}`);
    await sendEmail({
      to: user.email,
      subject: `Location Unlocked: ${property.title}`,
      html: `
        <h2>Payment Verified - Location Unlocked</h2>
        <p>Dear ${user.fullName},</p>
        <p>Your payment of ${payment.currency} ${payment.amount} has been verified.</p>
        <p>You can now view the exact coordinates, street address, and directions on the property page.</p>
      `
    });
  }

  static async notifyPaymentRejected(user, property, reason) {
    logger.info(`Notification: Payment rejected for ${user.email} on property ${property.title}`);
    await sendEmail({
      to: user.email,
      subject: `Payment Verification Update: ${property.title}`,
      html: `
        <h2>Payment Review Update</h2>
        <p>Dear ${user.fullName},</p>
        <p>Your payment submission for <strong>${property.title}</strong> could not be verified.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You may submit an updated transaction reference or contact support.</p>
      `
    });
  }
}
