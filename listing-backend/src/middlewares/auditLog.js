import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export const logAudit = async ({
  actorId = null,
  action,
  details,
  targetType,
  targetId = null,
  req = null
}) => {
  try {
    const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null : null;
    const userAgent = req ? req.headers['user-agent'] || null : null;

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        details: typeof details === 'string' ? details : JSON.stringify(details),
        targetType,
        targetId,
        ipAddress: ipAddress ? String(ipAddress) : null,
        userAgent: userAgent ? String(userAgent) : null
      }
    });
  } catch (error) {
    logger.error(`Failed to record audit log: ${error.message}`);
  }
};
