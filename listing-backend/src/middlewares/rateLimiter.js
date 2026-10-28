import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP address. Please try again later.'));
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT.AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many authentication attempts. Please try again in 15 minutes.'));
  }
});

export const resendVerificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 1, // Only 1 resend per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Rate limit reached. Please wait 60 seconds before requesting another verification email.'));
  }
});
