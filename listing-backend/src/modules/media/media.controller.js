import { MediaService } from './media.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class MediaController {
  static getPresignedUploadUrl = asyncHandler(async (req, res) => {
    const { propertyId, fileType, fileName } = req.body;
    const result = await MediaService.getPresignedUploadUrl(propertyId, fileType, fileName, req.user);
    res.status(200).json(ApiResponse.success(result, 'Presigned upload URL generated'));
  });

  static confirmUpload = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const media = await MediaService.confirmMediaUpload(propertyId, req.body, req.user);
    res.status(201).json(ApiResponse.created(media, 'Media record saved'));
  });

  static deleteMedia = asyncHandler(async (req, res) => {
    const result = await MediaService.deleteMedia(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(result, result.message));
  });
}
