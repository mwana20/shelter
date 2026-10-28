import { prisma } from '../../config/database.js';

export class PropertyRepository {
  static async findById(id) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            companyName: true,
            avatarUrl: true
          }
        },
        media: {
          orderBy: { sortOrder: 'asc' }
        },
        lockOverride: true
      }
    });
  }

  static async findBySlug(slug) {
    return prisma.property.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            companyName: true,
            avatarUrl: true
          }
        },
        media: {
          orderBy: { sortOrder: 'asc' }
        },
        lockOverride: true
      }
    });
  }

  static async findMany(where, skip, take, orderBy) {
    return prisma.property.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        media: {
          where: { isFeatured: true },
          take: 1
        },
        lockOverride: true
      }
    });
  }

  static async count(where) {
    return prisma.property.count({ where });
  }

  static async create(data) {
    return prisma.property.create({ data });
  }

  static async update(id, data) {
    return prisma.property.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return prisma.property.delete({
      where: { id }
    });
  }
}
