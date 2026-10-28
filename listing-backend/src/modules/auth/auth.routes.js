import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../../validators/auth.schema.js';
import { authenticate } from '../../middlewares/authenticate.js';
import {
  authRateLimiter,
  resendVerificationRateLimiter
} from '../../middlewares/rateLimiter.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  AuthController.verifyEmail
);

router.post(
  '/resend-verification',
  resendVerificationRateLimiter,
  validate({ body: resendVerificationSchema }),
  AuthController.resendVerification
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword
);

router.get('/me', authenticate, AuthController.getProfile);

export default router;
