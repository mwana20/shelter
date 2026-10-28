import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class UnlockService {
  static async getUnlockedLocation(propertyId, user) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    // Check authorization: Admin, Owner, or verified unlock record
    let isAuthorized = user.role === 'ADMIN' || property.ownerId === user.id;

    if (!isAuthorized) {
      const unlock = await prisma.locationUnlock.findUnique({
        where: {
          userId_propertyId: { userId: user.id, propertyId }
        }
      });
      isAuthorized = !!unlock;
    }

    if (!isAuthorized) {
      throw ApiError.forbidden(
        'Exact location for this property is locked. Please pay the unlock fee to access coordinates and directions.'
      );
    }

    return {
      propertyId: property.id,
      exactAddress: property.exactAddress,
      latitude: property.latitude,
      longitude: property.longitude,
      directionsGuide: property.directionsGuide,
      cadastralPlotNumber: property.cadastralPlotNumber,
      district: property.district,
      country: property.country,
      unlocked: true
    };
  }

  static async listUserUnlockedProperties(userId) {
    const unlocks = await prisma.locationUnlock.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            slug: true,
            title: true,
            district: true,
            country: true,
            price: true,
            currency: true,
            exactAddress: true,
            latitude: true,
            longitude: true
          }
        }
      },
      orderBy: { unlockedAt: 'desc' }
    });

    return unlocks;
  }
}
