import { InAppNotificationService } from './inapp.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class InAppNotificationController {
  static list = asyncHandler(async (req, res) => {
    const result = await InAppNotificationService.listForUser(req.user.id, req.query);
    res.status(200).json(ApiResponse.success(result, 'Notifications retrieved'));
  });

  static unreadCount = asyncHandler(async (req, res) => {
    const result = await InAppNotificationService.getUnreadCount(req.user.id);
    res.status(200).json(ApiResponse.success(result, 'Unread count retrieved'));
  });

  static markRead = asyncHandler(async (req, res) => {
    const result = await InAppNotificationService.markRead(req.params.id, req.user.id);
    res.status(200).json(ApiResponse.success(result, 'Notification marked as read'));
  });

  static markAllRead = asyncHandler(async (req, res) => {
    const result = await InAppNotificationService.markAllRead(req.user.id);
    res.status(200).json(ApiResponse.success(result, 'All notifications marked as read'));
  });
}