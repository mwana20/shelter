import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.js';
import { prisma } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token has expired. Please refresh your session.');
      }
      throw ApiError.unauthorized('Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    if (decoded.sid) {
      const session = await prisma.authSession.findFirst({
        where: {
          id: decoded.sid,
          userId: user.id,
          expiresAt: { gt: new Date() }
        },
        select: { id: true }
      });
      if (!session) {
        throw ApiError.unauthorized('Your session has expired. Please sign in again.');
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware:
 * Populates req.user if a valid token is present, but allows guests to proceed without throwing.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          emailVerified: true
        }
      });
      const sessionIsActive = !decoded.sid || await prisma.authSession.findFirst({
        where: {
          id: decoded.sid,
          userId: decoded.id,
          expiresAt: { gt: new Date() }
        },
        select: { id: true }
      });
      if (user && sessionIsActive) {
        req.user = user;
      }
    }
  } catch {
    // Guest user - ignore errors
  }
  next();
};
