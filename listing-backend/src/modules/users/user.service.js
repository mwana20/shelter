import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';

export class UserService {
  static async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        country: true,
        region: true,
        district: true,
        neighborhood: true,
        bio: true,
        role: true,
        companyName: true,
        agencyLicense: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        unlockedProperties: {
          select: {
            propertyId: true,
            unlockedAt: true
          }
        }
      }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  static async updateProfile(userId, updateData) {
    const allowed = {};
    if (updateData.fullName !== undefined) allowed.fullName = updateData.fullName.trim();
    if (updateData.phone !== undefined) allowed.phone = updateData.phone.trim() || null;
    if (updateData.country !== undefined) allowed.country = updateData.country.trim() || null;
    if (updateData.region !== undefined) allowed.region = updateData.region.trim() || null;
    if (updateData.district !== undefined) allowed.district = updateData.district.trim() || null;
    if (updateData.neighborhood !== undefined) allowed.neighborhood = updateData.neighborhood.trim() || null;
    if (updateData.bio !== undefined) allowed.bio = updateData.bio.trim() || null;
    if (updateData.companyName !== undefined) allowed.companyName = updateData.companyName.trim() || null;
    if (updateData.agencyLicense !== undefined) allowed.agencyLicense = updateData.agencyLicense.trim() || null;
    if (updateData.avatarUrl !== undefined) allowed.avatarUrl = updateData.avatarUrl;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: allowed,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        country: true,
        region: true,
        district: true,
        neighborhood: true,
        bio: true,
        role: true,
        companyName: true,
        agencyLicense: true,
        avatarUrl: true
      }
    });

    return updated;
  }

  static async listUsers(query) {
    const { page, limit, skip } = getPagination(query);
    const where = {};

    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return formatPaginationResponse(users, total, page, limit);
  }
}
