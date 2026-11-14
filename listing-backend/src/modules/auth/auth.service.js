import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { verifyAgeRequirement } from '../../utils/age.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  generateNumericCode,
  hashToken
} from '../../utils/token.js';
import { sendEmail } from '../notifications/email.service.js';
import { env } from '../../config/env.js';

const hashPasswordResetCode = (userId, code) =>
  crypto.createHmac('sha256', env.JWT.ACCESS_SECRET).update(`${userId}:${code}`).digest('hex');
const VERIFICATION_CODE_TTL_MS = 60 * 1000;
const PASSWORD_RESET_SESSION_TTL_MS = 15 * 60 * 1000;

export class AuthService {
  static async createSession(userId, payload) {
    const id = crypto.randomUUID();
    const refreshToken = generateRefreshToken({ ...payload, sid: id });
    const decoded = verifyRefreshToken(refreshToken);

    await prisma.authSession.create({
      data: {
        id,
        userId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(decoded.exp * 1000)
      }
    });

    return {
      accessToken: generateAccessToken({ ...payload, sid: id }),
      refreshToken
    };
  }

  static async register(data) {
    const email = data.email.toLowerCase().trim();

    // 1. Double-check age restriction (Backend must perform final verification)
    const ageCheck = verifyAgeRequirement(data.dateOfBirth, 18);
    if (!ageCheck.isValid) {
      throw ApiError.badRequest(ageCheck.message);
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists. Please sign in or reset your password.');
    }

    // 3. Hash password
    const passwordHash = await hashPassword(data.password);

    // 4. Create user record
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || null,
        dateOfBirth: new Date(data.dateOfBirth),
        country: data.country?.trim() || null,
        region: data.region?.trim() || null,
        district: data.district?.trim() || null,
        neighborhood: data.neighborhood?.trim() || null,
        bio: data.bio?.trim() || null,
        role: data.role || 'BUYER',
         accountStatus: (data.role === 'SELLER' || data.role === 'AGENT') ? 'PENDING' : 'APPROVED',
        companyName: data.companyName?.trim() || null,
        agencyLicense: data.agencyLicense?.trim() || null,
        emailVerified: false
      }
    });

    // Keep the email link and the 6-digit code on separate expiration windows.
    const token = generateRandomToken('vtok_');
    const code = generateNumericCode(6);
    const now = Date.now();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000);
    const codeExpiresAt = new Date(now + VERIFICATION_CODE_TTL_MS);

    await prisma.verificationToken.create({
      data: {
        token,
        code,
        userId: user.id,
        expiresAt,
        codeExpiresAt
      }
    });

    // 6. Send verification email
    const verificationUrl = `${env.APP_URL}/#/email-verification?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify your Sheltered Real Estate account',
      html: `
        <h2>Welcome to Sheltered Real Estate, ${user.fullName}!</h2>
        <p>Please verify your email address to activate all account features and start unlocking properties.</p>
        <p><a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email Address</a></p>
        <p>Or use your 6-digit verification code: <strong>${code}</strong></p>
        <p>This code is valid for 1 minute.</p>
        <p>This link is valid for 24 hours.</p>
      `
    });

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      emailVerified: false,
      ...(env.NODE_ENV !== 'production' ? { token, verificationCode: code } : {})
    };
  }

  static async login(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const session = await this.createSession(user.id, payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
         accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      },
      ...session
    };
  }

  static async refreshSession(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });
    if (!user) {
      throw ApiError.unauthorized('User associated with this session no longer exists.');
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    if (!decoded.sid) {
      return this.createSession(user.id, payload);
    }

    const oldTokenHash = hashToken(refreshToken);
    const existingSession = await prisma.authSession.findFirst({
      where: {
        id: decoded.sid,
        userId: user.id,
        refreshTokenHash: oldTokenHash,
        expiresAt: { gt: new Date() }
      }
    });
    if (!existingSession) {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    const nextRefreshToken = generateRefreshToken({ ...payload, sid: existingSession.id });
    const nextDecoded = verifyRefreshToken(nextRefreshToken);
    const updated = await prisma.authSession.updateMany({
      where: {
        id: existingSession.id,
        refreshTokenHash: oldTokenHash,
        expiresAt: { gt: new Date() }
      },
      data: {
        refreshTokenHash: hashToken(nextRefreshToken),
        expiresAt: new Date(nextDecoded.exp * 1000)
      }
    });
    if (updated.count !== 1) {
      throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    }

    return {
      accessToken: generateAccessToken({ ...payload, sid: existingSession.id }),
      refreshToken: nextRefreshToken
    };
  }

  static async endSession(refreshToken) {
    if (!refreshToken) return;

    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded.sid) {
        await prisma.authSession.deleteMany({
          where: {
            id: decoded.sid,
            userId: decoded.id,
            refreshTokenHash: hashToken(refreshToken)
          }
        });
      }
    } catch (error) {
      if (error.name !== 'TokenExpiredError' && error.name !== 'JsonWebTokenError') {
        throw error;
      }
    }
  }

  static async verifyEmail({ token, code, email }) {
    let tokenRecord;

    if (code && email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (user) {
        tokenRecord = await prisma.verificationToken.findFirst({
          where: {
            userId: user.id,
            code: code.trim(),
            used: false
          },
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        });
      }
    } else if (token) {
      tokenRecord = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true }
      });
    }

    if (!tokenRecord) {
      throw ApiError.badRequest('Invalid or missing email verification token');
    }

    if (tokenRecord.used) {
      throw ApiError.badRequest('This verification link has already been used. Please sign in.');
    }

    const tokenExpiresAt = code
      ? tokenRecord.codeExpiresAt || tokenRecord.expiresAt
      : tokenRecord.expiresAt;
    if (tokenExpiresAt <= new Date()) {
      throw ApiError.badRequest(
        code
          ? 'Verification code has expired. Please request a new verification email.'
          : 'Verification link has expired. Please request a new verification email.'
      );
    }

    // Mark token as used & activate user email
    await prisma.$transaction([
      prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      }),
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerified: true }
      })
    ]);

    return {
      email: tokenRecord.user.email,
      emailVerified: true
    };
  }

  static async resendVerification(email) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      // Return success-like response to avoid account enumeration
      return { message: 'If this email is registered and unverified, a verification link has been sent.' };
    }

    if (user.emailVerified) {
      throw ApiError.badRequest('This email address has already been verified.');
    }

    const token = generateRandomToken('vtok_');
    const code = generateNumericCode(6);
    const now = Date.now();
    const expiresAt = new Date(now + 24 * 60 * 60 * 1000);
    const codeExpiresAt = new Date(now + VERIFICATION_CODE_TTL_MS);

    await prisma.verificationToken.create({
      data: {
        token,
        code,
        userId: user.id,
        expiresAt,
        codeExpiresAt
      }
    });

    const verificationUrl = `${env.APP_URL}/#/email-verification?token=${token}`;
    await sendEmail({
      to: cleanEmail,
      subject: 'Verify your Sheltered Real Estate account',
      html: `
        <h2>Email Verification Link</h2>
        <p>Click below to verify your account:</p>
        <p><a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background-color:#059669;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email</a></p>
        <p>Security code: <strong>${code}</strong></p>
        <p>This code is valid for 1 minute. The link is valid for 24 hours.</p>
      `
    });

    return {
      message: 'Verification email resent successfully.',
      token // For testing convenience
    };
  }

  static async forgotPassword(email) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    // SECURITY RULE: Always return a neutral response to prevent user enumeration
    const neutralMessage = 'If this email is registered, a password reset code has been sent.';

    if (!user) {
      return { message: neutralMessage };
    }

    // Invalidate existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

    await prisma.passwordResetToken.create({
      data: {
        token: hashPasswordResetCode(user.id, code),
        userId: user.id,
        expiresAt
      }
    });

    await sendEmail({
      to: cleanEmail,
      subject: 'Password Reset Request - Sheltered Real Estate',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Sheltered account.</p>
        <p>Your 6-digit password reset code is: <strong>${code}</strong></p>
        <p>This code is valid for 1 minute only and can be used once.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    return {
      message: neutralMessage,
      previewCode: env.NODE_ENV === 'development' ? code : undefined
    };
  }

  static async verifyPasswordResetCode(email, code) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true }
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset code. Please request a new code.');
    }

    const codeToken = hashPasswordResetCode(user.id, code.trim());
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token: codeToken }
    });
    if (!resetRecord || resetRecord.userId !== user.id || resetRecord.used || resetRecord.expiresAt <= new Date()) {
      throw ApiError.badRequest('Invalid or expired password reset code. Please request a new code.');
    }

    const resetToken = generateRandomToken('rtok_');
    const resetSessionExpiresAt = new Date(Date.now() + PASSWORD_RESET_SESSION_TTL_MS);
    const verified = await prisma.passwordResetToken.updateMany({
      where: {
        id: resetRecord.id,
        token: codeToken,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: { token: resetToken, expiresAt: resetSessionExpiresAt }
    });
    if (verified.count !== 1) {
      throw ApiError.badRequest('Invalid or expired password reset code. Please request a new code.');
    }

    return {
      resetToken,
      message: 'Code verified. You can now choose a new password.'
    };
  }

  static async resetPassword(token, newPassword) {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRecord) {
      throw ApiError.badRequest('Invalid password reset session. Please request a new code.');
    }

    if (resetRecord.used) {
      throw ApiError.badRequest('This password reset session has already been used. Please request a new code.');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw ApiError.badRequest('This password reset session has expired. Please request a new code.');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true }
      }),
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash }
      })
    ]);

    return { message: 'Password reset successfully. You can now sign in with your new password.' };
  }
}
