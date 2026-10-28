import { PropertyService } from './property.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class PropertyController {
  static listProperties = asyncHandler(async (req, res) => {
    const result = await PropertyService.listProperties(req.query, req.user);
    res.status(200).json(ApiResponse.success(result, 'Properties retrieved successfully'));
  });

  static getPropertyById = asyncHandler(async (req, res) => {
    const property = await PropertyService.getPropertyById(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(property, 'Property retrieved successfully'));
  });

  static getPropertyBySlug = asyncHandler(async (req, res) => {
    const property = await PropertyService.getPropertyBySlug(req.params.slug, req.user);
    res.status(200).json(ApiResponse.success(property, 'Property retrieved successfully'));
  });

  static createProperty = asyncHandler(async (req, res) => {
    const property = await PropertyService.createProperty(req.body, req.user.id);
    res.status(201).json(ApiResponse.created(property, 'Property created and submitted for review'));
  });

  static updateProperty = asyncHandler(async (req, res) => {
    const updated = await PropertyService.updateProperty(req.params.id, req.body, req.user);
    res.status(200).json(ApiResponse.success(updated, 'Property updated successfully'));
  });

  static deleteProperty = asyncHandler(async (req, res) => {
    const result = await PropertyService.deleteProperty(req.params.id, req.user);
    res.status(200).json(ApiResponse.success(result, 'Property deleted successfully'));
  });
}
