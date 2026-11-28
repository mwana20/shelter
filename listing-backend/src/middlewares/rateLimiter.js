import rateLimit from 'express-rate-limit';
import { isIP } from 'node:net';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const clientKey = (req) => {
  const clientIp = req.headers['x-client-ip'];
  const hasTrustedProxyHeader =
    Boolean(env.PROXY_SECRET) && req.headers['x-proxy-secret'] === env.PROXY_SECRET;

  if (hasTrustedProxyHeader && typeof clientIp === 'string' && isIP(clientIp)) {
    return clientIp;
  }

  return req.ip;
};

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT.WINDOW_MS,
  max: env.RATE_LIMIT.MAX,
  keyGenerator: clientKey,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP address. Please try again later.'));
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT.AUTH_MAX,
  keyGenerator: clientKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many authentication attempts. Please try again in 15 minutes.'));
  }
});

export const resendVerificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 1, // Only 1 resend per minute
  keyGenerator: clientKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Rate limit reached. Please wait 60 seconds before requesting another verification email.'));
  }
});
