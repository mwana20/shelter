import { MediaService } from './media.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class MediaController {
  static getUploadLimits = asyncHandler(async (req, res) => {
    res.status(200).json(ApiResponse.success(MediaService.getUploadLimits(), 'Upload limits retrieved'));
  });

  static getPresignedUploadUrls = asyncHandler(async (req, res) => {
    const result = await MediaService.createUploadBatch(req.body, req.user);
    res.status(201).json(ApiResponse.created(result, 'Presigned upload URLs generated'));
  });

  static refreshPresignedUploadUrls = asyncHandler(async (req, res) => {
    const result = await MediaService.refreshUploadUrls(req.params.batchId, req.body.clientIds, req.user);
    res.status(200).json(ApiResponse.success(result, 'Presigned upload URLs refreshed'));
  });

  static deleteMedia = asyncHandler(async (req, res) => {
    const result = await MediaService.deleteMedia(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(result, result.message));
  });
}
