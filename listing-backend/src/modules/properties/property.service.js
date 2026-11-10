import { PropertyRepository } from './property.repository.js';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateSlug } from '../../utils/slug.js';
import { getPagination, formatPaginationResponse } from '../../utils/pagination.js';
import { sanitizePropertyLocation } from './property.utils.js';
import { MediaService } from '../media/media.service.js';

export class PropertyService {
  /**
   * Evaluates whether location locking is active for this property,
   * and whether the requesting user has paid/verified access to view it.
   */
  static async isLocationAccessible(property, user) {
    // 1. Admins and property owners always have full access
    if (user && (user.role === 'ADMIN' || user.id === property.ownerId)) {
      return true;
    }

    // 2. Fetch global location lock setting (DISABLED BY DEFAULT)
    let globalSetting = await prisma.locationLockSetting.findUnique({
      where: { id: 'global_setting' }
    });

    if (!globalSetting) {
      globalSetting = { enabledGlobally: false };
    }

    // 3. Determine if locking applies to this property
    let isLocked = false;
    if (property.lockOverride !== null && property.lockOverride !== undefined) {
      isLocked = property.lockOverride.isLocked;
    } else {
      isLocked = globalSetting.enabledGlobally;
    }

    // If listing is not locked, location is publicly accessible
    if (!isLocked) {
      return true;
    }

    // 4. Listing IS locked. User must be authenticated and have a verified unlock
    if (!user) {
      return false;
    }

    const unlockRecord = await prisma.locationUnlock.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: property.id
        }
      }
    });

    return !!unlockRecord;
  }

  static async getPropertyById(id, requestingUser = null) {
    const property = await PropertyRepository.findById(id);
    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    // Increment views asynchronously
    prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(() => {});

    const canViewExact = await this.isLocationAccessible(property, requestingUser);
    return sanitizePropertyLocation(property, canViewExact);
  }

  static async getPropertyBySlug(slug, requestingUser = null) {
    const property = await PropertyRepository.findBySlug(slug);
    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    const canViewExact = await this.isLocationAccessible(property, requestingUser);
    return sanitizePropertyLocation(property, canViewExact);
  }

  static async listProperties(query, requestingUser = null) {
    const { page, limit, skip } = getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'ACTIVE';
    }

    if (query.listingType && query.listingType !== 'All') {
      where.listingType = query.listingType.toUpperCase();
    }

    if (query.propertyType) {
      where.propertyType = { contains: query.propertyType, mode: 'insensitive' };
    }

    if (query.country) {
      where.country = { contains: query.country, mode: 'insensitive' };
    }

    if (query.district) {
      where.district = { contains: query.district, mode: 'insensitive' };
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.price.lte = parseFloat(query.maxPrice);
    }

    if (query.bedrooms && query.bedrooms !== 'Any') {
      where.bedrooms = { gte: parseInt(query.bedrooms, 10) };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { district: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (query.sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (query.sortBy === 'views') orderBy = { viewsCount: 'desc' };

    const [properties, total] = await Promise.all([
      PropertyRepository.findMany(where, skip, limit, orderBy),
      PropertyRepository.count(where)
    ]);

    // Check location locking accessibility for each property
    const sanitizedItems = await Promise.all(
      properties.map(async (prop) => {
        const canViewExact = await this.isLocationAccessible(prop, requestingUser);
        return sanitizePropertyLocation(prop, canViewExact);
      })
    );

    return formatPaginationResponse(sanitizedItems, total, page, limit);
  }

  static async createProperty(data, ownerId) {
     const owner = await prisma.user.findUnique({ where: { id: ownerId } });
     if (!owner) throw ApiError.unauthorized('User not found');
     if (!['SELLER', 'AGENT'].includes(owner.role)) {
       throw ApiError.forbidden('Only property owners and brokers can create listings.');
     }
     if ((owner.role === 'SELLER' || owner.role === 'AGENT') && owner.accountStatus !== 'APPROVED') {
       throw ApiError.forbidden('Your account is pending admin approval. You cannot list properties until approved.');
     }

    const { propertyId, mediaBatchId, mediaRefs, ...propertyData } = data;
    const mediaBatch = await MediaService.prepareUploadBatch(mediaBatchId, propertyId, mediaRefs, owner);
    if (mediaBatch.alreadyConsumed) return mediaBatch.property;
    try {
      const property = await prisma.$transaction((transaction) => transaction.property.create({
        data: {
          ...propertyData,
          id: propertyId,
          slug: generateSlug(data.title),
          ownerId,
          status: 'PENDING_REVIEW',
          media: { create: mediaBatch.mediaRecords }
        },
        include: { media: { orderBy: { sortOrder: 'asc' } } }
      }));
      await MediaService.completeUploadBatch(mediaBatchId, mediaBatch.stagingKeys);
      return property;
    } catch (error) {
      await MediaService.rollbackUploadBatch(mediaBatchId, mediaBatch.promotedKeys);
      throw error;
    }
  }

  static async updateProperty(id, data, user) {
    const existing = await PropertyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Property not found');
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to update this property');
    }

    const { mediaBatchId, mediaRefs, ...propertyData } = data;
    if (Boolean(mediaBatchId) !== Boolean(mediaRefs)) {
      throw ApiError.badRequest('A complete media upload batch is required to replace listing media.');
    }

    if (!mediaBatchId) return PropertyRepository.update(id, propertyData);

    const mediaBatch = await MediaService.prepareUploadBatch(mediaBatchId, id, mediaRefs, user);
    if (mediaBatch.alreadyConsumed) return mediaBatch.property;
    try {
      const updated = await prisma.$transaction(async (transaction) => {
        await transaction.media.updateMany({
          where: { propertyId: id, isActive: true },
          data: { isActive: false }
        });
        return transaction.property.update({
          where: { id },
          data: { ...propertyData, media: { create: mediaBatch.mediaRecords } },
          include: { media: { orderBy: { sortOrder: 'asc' } } }
        });
      });
      await MediaService.completeUploadBatch(mediaBatchId, mediaBatch.stagingKeys);
      await MediaService.cleanupInactiveMedia();
      return updated;
    } catch (error) {
      await MediaService.rollbackUploadBatch(mediaBatchId, mediaBatch.promotedKeys);
      throw error;
    }
  }

  static async deleteProperty(id, user) {
    const existing = await PropertyRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Property not found');
    }

    if (user.role !== 'ADMIN' && existing.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to delete this property');
    }

    const allMedia = await prisma.media.findMany({ where: { propertyId: id } });
    await MediaService.deleteStoredMedia(allMedia);
    await PropertyRepository.delete(id);
    return { success: true, message: 'Property deleted successfully' };
  }
}
