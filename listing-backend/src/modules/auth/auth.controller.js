import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE = 'sheltered_refresh';
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: env.AUTH_COOKIE_SAME_SITE,
  path: `${env.API_PREFIX}/auth`
};

const refreshTokenFromRequest = (req) => {
  if (req.cookies?.[REFRESH_COOKIE]) return req.cookies[REFRESH_COOKIE];
  if (req.body?.refreshToken) return req.body.refreshToken;
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REFRESH_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(REFRESH_COOKIE.length + 1)) : null;
};

export class AuthController {
  static register = asyncHandler(async (req, res) => {
    const result = await AuthService.register(req.body);
    res.status(201).json(ApiResponse.created(result, 'Registration successful. Please verify your email.'));
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(200).json(ApiResponse.success({
      user: result.user,
      accessToken: result.accessToken
    }, 'Signed in successfully.'));
  });

  static refresh = asyncHandler(async (req, res) => {
    const result = await AuthService.refreshSession(refreshTokenFromRequest(req));
    res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(200).json(ApiResponse.success({
      accessToken: result.accessToken
    }, 'Session refreshed successfully.'));
  });

  static logout = asyncHandler(async (req, res) => {
    await AuthService.endSession(refreshTokenFromRequest(req));
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    res.status(200).json(ApiResponse.success(null, 'Signed out successfully.'));
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

  static verifyPasswordResetCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    const result = await AuthService.verifyPasswordResetCode(email, code);
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
