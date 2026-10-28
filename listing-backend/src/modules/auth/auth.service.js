import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { verifyAgeRequirement } from '../../utils/age.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  generateNumericCode
} from '../../utils/token.js';
import { sendEmail } from '../notifications/email.service.js';
import { env } from '../../config/env.js';

export class AuthService {
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
        companyName: data.companyName?.trim() || null,
        agencyLicense: data.agencyLicense?.trim() || null,
        emailVerified: false
      }
    });

    // 5. Create verification token (24 hours expiry) & 6-digit code
    const token = generateRandomToken('vtok_');
    const code = generateNumericCode(6);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        token,
        code,
        userId: user.id,
        expiresAt
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

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      },
      accessToken,
      refreshToken
    };
  }

  static async verifyEmail({ token, code, email }) {
    let tokenRecord;

    if (token) {
      tokenRecord = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true }
      });
    } else if (code && email) {
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
    }

    if (!tokenRecord) {
      throw ApiError.badRequest('Invalid or missing email verification token');
    }

    if (tokenRecord.used) {
      throw ApiError.badRequest('This verification link has already been used. Please sign in.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw ApiError.badRequest('Verification link has expired. Please request a new verification email.');
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        token,
        code,
        userId: user.id,
        expiresAt
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
    const neutralMessage = 'If this email is registered, a password reset link has been sent.';

    if (!user) {
      return { message: neutralMessage };
    }

    // Invalidate existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Generate 15-minute reset token
    const token = generateRandomToken('rtok_');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    const resetUrl = `${env.APP_URL}/#/reset-password?token=${token}`;
    await sendEmail({
      to: cleanEmail,
      subject: 'Password Reset Request - Sheltered Real Estate',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Sheltered account.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a></p>
        <p>This link is valid for 15 minutes only and can be used once.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    return {
      message: neutralMessage,
      previewToken: env.NODE_ENV === 'development' ? token : undefined
    };
  }

  static async resetPassword(token, newPassword) {
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRecord) {
      throw ApiError.badRequest('Invalid password reset link. Please request a new one.');
    }

    if (resetRecord.used) {
      throw ApiError.badRequest('This password reset link has already been used. Please request a new one.');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw ApiError.badRequest('This password reset link has expired. Password reset links are valid for 15 minutes.');
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
