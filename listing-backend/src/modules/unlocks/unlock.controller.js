import { UnlockService } from './unlock.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class UnlockController {
  static getUnlockedLocation = asyncHandler(async (req, res) => {
    const data = await UnlockService.getUnlockedLocation(req.params.propertyId, req.user);
    res.status(200).json(ApiResponse.success(data, 'Confidential location details revealed'));
  });

  static listMyUnlockedProperties = asyncHandler(async (req, res) => {
    const list = await UnlockService.listUserUnlockedProperties(req.user.id);
    res.status(200).json(ApiResponse.success(list, 'User unlocked properties list'));
  });
}
