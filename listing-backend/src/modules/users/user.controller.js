import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class UserController {
  static getProfile = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.id);
    res.status(200).json(ApiResponse.success(user, 'User profile retrieved'));
  });

  static updateProfile = asyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.user.id, req.body);
    res.status(200).json(ApiResponse.success(user, 'Profile updated successfully'));
  });

  static getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json(ApiResponse.success(user, 'User details retrieved'));
  });

  static listUsers = asyncHandler(async (req, res) => {
    const result = await UserService.listUsers(req.query);
    res.status(200).json(ApiResponse.success(result, 'Users list retrieved'));
  });
}
