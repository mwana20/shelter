import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(ApiResponse.created(result, 'Registration successful. Please verify your email.'));
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(ApiResponse.success(result, 'Signed in successfully.'));
  });

  static verifyEmail = asyncHandler(async (req, res) => {
    const result = await AuthService.verifyEmail(req.body);
    res.status(200).json(ApiResponse.success(result, 'Email verified successfully. You may now access your account.'));
  });

  static resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.resendVerification(email);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static getProfile = asyncHandler(async (req, res) => {
    res.status(200).json(ApiResponse.success(req.user, 'Current user profile retrieved'));
  });
}
