import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';
import { MediaService } from './modules/media/media.service.js';

const PORT = env.PORT;

const mediaCleanupTimer = setInterval(() => {
  Promise.all([
    MediaService.cleanupExpiredBatches(),
    MediaService.cleanupInactiveMedia()
  ]).catch((error) => logger.error('Scheduled property media cleanup failed:', error));
}, 15 * 60 * 1000);
mediaCleanupTimer.unref();

void Promise.all([
  MediaService.cleanupExpiredBatches(),
  MediaService.cleanupInactiveMedia()
]).catch((error) => logger.error('Initial property media cleanup failed:', error));

const server = app.listen(PORT, () => {
  logger.info(`===================================================`);
  logger.info(`🚀 Sheltered Listing Backend API Server Live`);
  logger.info(`📡 Port: ${PORT} | Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Base URL: http://localhost:${PORT}${env.API_PREFIX}`);
  logger.info(`🛡️ Location Locking Policy: Backend Enforced`);
  logger.info(`===================================================`);
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('Prisma database client disconnected');
    } catch (e) {
      logger.error('Error disconnecting Prisma:', e);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception thrown: ${error.stack}`);
  process.exit(1);
});
