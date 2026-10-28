import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../config/r2.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import crypto from 'crypto';

export class MediaService {
  static async getPresignedUploadUrl(propertyId, fileType, fileName, user) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to upload media for this property');
    }

    const fileExtension = fileName.split('.').pop() || 'jpg';
    const storageKey = `properties/${propertyId}/${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;

    let uploadUrl = null;

    if (s3Client) {
      const command = new PutObjectCommand({
        Bucket: env.R2.BUCKET_NAME,
        Key: storageKey,
        ContentType: fileType
      });
      uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } else {
      // Mock upload URL for development/sandbox mode
      uploadUrl = `${env.APP_URL}/api/v1/media/mock-upload/${encodeURIComponent(storageKey)}`;
    }

    const publicUrl = `${env.R2.PUBLIC_DOMAIN}/${storageKey}`;

    return {
      uploadUrl,
      publicUrl,
      storageKey
    };
  }

  static async confirmMediaUpload(propertyId, data, user) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to update media for this property');
    }

    const media = await prisma.media.create({
      data: {
        propertyId,
        storageKey: data.storageKey,
        publicUrl: data.publicUrl,
        mimeType: data.mimeType || 'image/jpeg',
        fileSize: data.fileSize || 0,
        sortOrder: data.sortOrder || 0,
        isFeatured: data.isFeatured || false
      }
    });

    return media;
  }

  static async deleteMedia(mediaId, user) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { property: true }
    });

    if (!media) {
      throw ApiError.notFound('Media not found');
    }

    if (user.role !== 'ADMIN' && media.property.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to delete this media');
    }

    if (s3Client) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: env.R2.BUCKET_NAME,
          Key: media.storageKey
        }));
      } catch (err) {
        console.error('Failed to delete S3/R2 object:', err);
      }
    }

    await prisma.media.delete({ where: { id: mediaId } });
    return { success: true, message: 'Media deleted successfully' };
  }
}
