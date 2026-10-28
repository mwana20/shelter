import { logger } from '../../config/logger.js';

export const mediaWorker = async (jobData) => {
  logger.info(`[Media Worker] Processing media asset: ${jobData.storageKey}`);
  // Optimization / thumbnail generation hook
};
