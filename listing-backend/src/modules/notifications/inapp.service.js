import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';

export class InAppNotificationService {
  static async listForUser(userId, query = {}) {
    const { page, limit, skip } = getPagination(query, 20);
    const where = { userId };
    if (query.unreadOnly === 'true') where.read = false;
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);
    return formatPaginationResponse(items, total, page, limit);
  }

  static async getUnreadCount(userId) {
    const count = await prisma.notification.count({ where: { userId, read: false } });
    return { count };
  }

  static async markRead(id, userId) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) throw ApiError.notFound('Notification not found');
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return updated;
  }

  static async markAllRead(userId) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return { success: true };
  }
}