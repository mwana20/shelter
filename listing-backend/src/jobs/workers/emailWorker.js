import { sendEmail } from '../../modules/notifications/email.service.js';
import { logger } from '../../config/logger.js';

export const emailWorker = async (jobData) => {
  logger.info(`[Email Worker] Processing email for ${jobData.to}`);
  await sendEmail(jobData);
};
