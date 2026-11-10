import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { s3Client } from '../../config/r2.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const THUMBNAIL_TYPES = new Set(['image/jpeg', 'image/webp']);
const VIDEO_TYPE = 'video/mp4';
const extensionForType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4'
};

function requireR2() {
  if (!s3Client || !env.R2.PUBLIC_URL) {
    throw new ApiError(503, 'Property media storage is not configured. Contact support.');
  }
}

function assertUploadRole(user) {
  if (!['SELLER', 'AGENT'].includes(user.role)) {
    throw ApiError.forbidden('Only property owners and brokers may upload property media.');
  }
}

async function assertApprovedUploader(user) {
  assertUploadRole(user);
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { accountStatus: true } });
  if (!account) throw ApiError.unauthorized('User not found');
  if (account.accountStatus !== 'APPROVED') {
    throw ApiError.forbidden('Your account must be approved before uploading property media.');
  }
}

function publicUrl(key) {
  const baseUrl = env.R2.PUBLIC_URL.replace(/\/+$/, '');
  return `${baseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

function validateFileLimits(file) {
  if (file.kind === 'IMAGE') {
    if (!IMAGE_TYPES.has(file.mimeType) || file.fileSize > env.R2.MAX_IMAGE_SIZE_BYTES) {
      throw ApiError.unprocessable(`Each image must be JPEG, PNG, or WebP and no larger than ${env.R2.MAX_IMAGE_SIZE_BYTES} bytes.`);
    }
    if (!file.thumbnail || !THUMBNAIL_TYPES.has(file.thumbnail.mimeType) || file.thumbnail.fileSize > env.R2.MAX_THUMBNAIL_SIZE_BYTES) {
      throw ApiError.unprocessable(`Each thumbnail must be JPEG or WebP and no larger than ${env.R2.MAX_THUMBNAIL_SIZE_BYTES} bytes.`);
    }
    return;
  }

  if (file.mimeType !== VIDEO_TYPE || file.fileSize > env.R2.MAX_VIDEO_SIZE_BYTES) {
    throw ApiError.unprocessable(`The video must be MP4 and no larger than ${env.R2.MAX_VIDEO_SIZE_BYTES} bytes.`);
  }
  if (file.thumbnail && (!THUMBNAIL_TYPES.has(file.thumbnail.mimeType) || file.thumbnail.fileSize > env.R2.MAX_THUMBNAIL_SIZE_BYTES)) {
    throw ApiError.unprocessable(`The video poster must be JPEG or WebP and no larger than ${env.R2.MAX_THUMBNAIL_SIZE_BYTES} bytes.`);
  }
}

function getManifestKeys(manifest) {
  return manifest.files.flatMap((file) => [file.storageKey, file.thumbnailStorageKey].filter(Boolean));
}

async function deleteObjectKeys(keys) {
  const objects = [...new Set(keys.filter(Boolean))].map((Key) => ({ Key }));
  if (!objects.length) return;
  requireR2();
  const result = await s3Client.send(new DeleteObjectsCommand({
    Bucket: env.R2.BUCKET_NAME,
    Delete: { Objects: objects, Quiet: true }
  }));
  if (result.Errors?.length) throw new Error(`R2 failed to delete ${result.Errors.length} media object(s).`);
}

function validateRefsAgainstManifest(refs, manifest) {
  if (!Array.isArray(refs) || refs.length !== 5 || manifest.files.length !== 5) {
    throw ApiError.unprocessable('A property requires exactly four images and one video.');
  }
  const byClientId = new Map(refs.map((ref) => [ref.clientId, ref]));
  if (byClientId.size !== refs.length) throw ApiError.unprocessable('Media client identifiers must be unique.');

  for (const file of manifest.files) {
    const ref = byClientId.get(file.clientId);
    if (
      !ref || ref.kind !== file.kind || ref.storageKey !== file.storageKey ||
      (ref.thumbnailStorageKey || null) !== (file.thumbnailStorageKey || null)
    ) {
      throw ApiError.forbidden('The submitted media keys do not match this upload batch.');
    }
  }
}

function fileSignatureMatches(mimeType, bytes) {
  if (mimeType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (mimeType === VIDEO_TYPE) return bytes.toString('ascii', 4, 8) === 'ftyp';
  return false;
}

async function verifyR2Object(key, mimeType, fileSize, maxSize) {
  const head = await s3Client.send(new HeadObjectCommand({ Bucket: env.R2.BUCKET_NAME, Key: key }));
  if (Number(head.ContentLength) !== fileSize || head.ContentLength > maxSize || head.ContentType !== mimeType) {
    throw ApiError.unprocessable('An uploaded media file does not match its declared type or size.');
  }
  const rangedObject = await s3Client.send(new GetObjectCommand({
    Bucket: env.R2.BUCKET_NAME,
    Key: key,
    Range: 'bytes=0-15'
  }));
  if (!/^bytes 0-(?:[0-9]|1[0-5])\//.test(rangedObject.ContentRange || '')) {
    rangedObject.Body?.destroy?.();
    throw ApiError.unprocessable('Storage did not honor the bounded media signature check.');
  }
  const bytes = Buffer.from(await rangedObject.Body.transformToByteArray());
  if (bytes.length > 16 || !fileSignatureMatches(mimeType, bytes)) {
    throw ApiError.unprocessable('An uploaded file does not contain valid media data for its declared type.');
  }
}

async function signManifestFile(file) {
  const uploadUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: env.R2.BUCKET_NAME,
      Key: file.storageKey,
      ContentType: file.mimeType,
      ContentLength: file.fileSize
    }),
    { expiresIn: Math.min(env.R2.UPLOAD_URL_TTL_SECONDS, 900) }
  );
  const thumbnailUploadUrl = file.thumbnailStorageKey
    ? await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: env.R2.BUCKET_NAME,
          Key: file.thumbnailStorageKey,
          ContentType: file.thumbnailMimeType,
          ContentLength: file.thumbnailFileSize
        }),
        { expiresIn: Math.min(env.R2.UPLOAD_URL_TTL_SECONDS, 900) }
      )
    : null;

  return {
    clientId: file.clientId,
    kind: file.kind,
    storageKey: file.storageKey,
    uploadUrl,
    mimeType: file.mimeType,
    thumbnailStorageKey: file.thumbnailStorageKey || null,
    thumbnailUploadUrl,
    thumbnailMimeType: file.thumbnailMimeType || null
  };
}

export class MediaService {
  static getUploadLimits() {
    return {
      imageCount: 4,
      videoCount: 1,
      imageTypes: [...IMAGE_TYPES],
      videoTypes: [VIDEO_TYPE],
      maxImageSizeBytes: env.R2.MAX_IMAGE_SIZE_BYTES,
      maxVideoSizeBytes: env.R2.MAX_VIDEO_SIZE_BYTES,
      maxThumbnailSizeBytes: env.R2.MAX_THUMBNAIL_SIZE_BYTES
    };
  }

  static async createUploadBatch({ propertyId, files }, user) {
    await assertApprovedUploader(user);
    requireR2();
    await this.cleanupExpiredBatches();

    let targetPropertyId = propertyId;
    if (propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true, ownerId: true } });
      if (!property) throw ApiError.notFound('Property not found');
      if (property.ownerId !== user.id) throw ApiError.forbidden('You are not authorized to replace media for this property.');
      targetPropertyId = property.id;
    } else {
      targetPropertyId = crypto.randomUUID();
    }

    files.forEach(validateFileLimits);
    const batchId = crypto.randomUUID();
    const manifestFiles = files.map((file) => {
      const prefix = `staging/${user.id}/${batchId}/${file.clientId}`;
      return {
        clientId: file.clientId,
        kind: file.kind,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        storageKey: `${prefix}/${crypto.randomUUID()}.${extensionForType[file.mimeType]}`,
        thumbnailMimeType: file.thumbnail?.mimeType || null,
        thumbnailFileSize: file.thumbnail?.fileSize || null,
        thumbnailStorageKey: file.thumbnail
          ? `${prefix}/thumbnail-${crypto.randomUUID()}.${extensionForType[file.thumbnail.mimeType]}`
          : null
      };
    });
    const expiresAt = new Date(Date.now() + env.R2.UPLOAD_BATCH_TTL_MINUTES * 60 * 1000);
    const batch = await prisma.mediaUploadBatch.create({
      data: { id: batchId, ownerId: user.id, propertyId: targetPropertyId, manifest: { files: manifestFiles }, expiresAt }
    });

    try {
      return {
        batchId: batch.id,
        propertyId: targetPropertyId,
        expiresAt,
        files: await Promise.all(manifestFiles.map(signManifestFile))
      };
    } catch (error) {
      await prisma.mediaUploadBatch.delete({ where: { id: batch.id } });
      throw error;
    }
  }

  static async refreshUploadUrls(batchId, clientIds, user) {
    await assertApprovedUploader(user);
    requireR2();
    const batch = await prisma.mediaUploadBatch.findUnique({ where: { id: batchId } });
    if (!batch || batch.ownerId !== user.id) throw ApiError.notFound('Upload batch not found');
    if (batch.consumedAt || batch.expiresAt <= new Date()) throw ApiError.conflict('This upload batch has expired or has already been used.');

    const files = batch.manifest.files.filter((file) => clientIds.includes(file.clientId));
    if (files.length !== new Set(clientIds).size) throw ApiError.badRequest('One or more upload identifiers are not part of this batch.');
    return { batchId, expiresAt: batch.expiresAt, files: await Promise.all(files.map(signManifestFile)) };
  }

  static async prepareUploadBatch(batchId, propertyId, mediaRefs, user) {
    await assertApprovedUploader(user);
    requireR2();
    const batch = await prisma.mediaUploadBatch.findUnique({ where: { id: batchId } });
    if (!batch || batch.ownerId !== user.id) throw ApiError.notFound('Upload batch not found');
    if (batch.propertyId !== propertyId) throw ApiError.forbidden('The upload batch is not for this listing.');
    validateRefsAgainstManifest(mediaRefs, batch.manifest);
    if (batch.consumedAt) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { media: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } }
      });
      if (property?.ownerId === user.id) return { alreadyConsumed: true, property };
      throw ApiError.conflict('This upload batch is already being processed.');
    }
    if (batch.expiresAt <= new Date()) throw ApiError.conflict('This upload batch has expired.');

    const claim = await prisma.mediaUploadBatch.updateMany({
      where: { id: batchId, ownerId: user.id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() }
    });
    if (claim.count !== 1) throw ApiError.conflict('This upload batch has already been used.');

    const promotedKeys = [];
    try {
      const mediaRecords = [];
      const manifestFiles = [...batch.manifest.files].sort((a, b) => (
        a.kind === b.kind ? a.clientId.localeCompare(b.clientId) : a.kind === 'IMAGE' ? -1 : 1
      ));

      for (const [index, file] of manifestFiles.entries()) {
        const maxFileSize = file.kind === 'IMAGE' ? env.R2.MAX_IMAGE_SIZE_BYTES : env.R2.MAX_VIDEO_SIZE_BYTES;
        await verifyR2Object(file.storageKey, file.mimeType, file.fileSize, maxFileSize);
        if (file.thumbnailStorageKey) {
          await verifyR2Object(file.thumbnailStorageKey, file.thumbnailMimeType, file.thumbnailFileSize, env.R2.MAX_THUMBNAIL_SIZE_BYTES);
        }

        const finalPrefix = `properties/${propertyId}/${file.kind.toLowerCase()}`;
        const storageKey = `${finalPrefix}/${crypto.randomUUID()}.${extensionForType[file.mimeType]}`;
        await s3Client.send(new CopyObjectCommand({
          Bucket: env.R2.BUCKET_NAME,
          Key: storageKey,
          CopySource: `${env.R2.BUCKET_NAME}/${file.storageKey.split('/').map(encodeURIComponent).join('/')}`,
          ContentType: file.mimeType,
          CacheControl: 'public, max-age=31536000, immutable',
          MetadataDirective: 'REPLACE'
        }));
        promotedKeys.push(storageKey);

        let thumbnailStorageKey = null;
        let thumbnailUrl = null;
        if (file.thumbnailStorageKey) {
          thumbnailStorageKey = `${finalPrefix}/thumbnails/${crypto.randomUUID()}.${extensionForType[file.thumbnailMimeType]}`;
          await s3Client.send(new CopyObjectCommand({
            Bucket: env.R2.BUCKET_NAME,
            Key: thumbnailStorageKey,
            CopySource: `${env.R2.BUCKET_NAME}/${file.thumbnailStorageKey.split('/').map(encodeURIComponent).join('/')}`,
            ContentType: file.thumbnailMimeType,
            CacheControl: 'public, max-age=31536000, immutable',
            MetadataDirective: 'REPLACE'
          }));
          promotedKeys.push(thumbnailStorageKey);
          thumbnailUrl = publicUrl(thumbnailStorageKey);
        }

        mediaRecords.push({
          storageKey,
          publicUrl: publicUrl(storageKey),
          mimeType: file.mimeType,
          fileSize: file.fileSize,
          kind: file.kind,
          thumbnailStorageKey,
          thumbnailUrl,
          sortOrder: file.kind === 'IMAGE' ? index : 4,
          isFeatured: file.kind === 'IMAGE' && index === 0
        });
      }
      return { batchId, mediaRecords, promotedKeys, stagingKeys: getManifestKeys(batch.manifest) };
    } catch (error) {
      await deleteObjectKeys(promotedKeys).catch((cleanupError) => console.error('Failed to roll back promoted R2 media:', cleanupError));
      await prisma.mediaUploadBatch.update({ where: { id: batchId }, data: { consumedAt: null } }).catch(() => {});
      throw error;
    }
  }

  static async completeUploadBatch(batchId, stagingKeys) {
    try {
      await deleteObjectKeys(stagingKeys);
    } catch (error) {
      console.error('Deferred cleanup required for consumed media upload batch:', batchId, error);
    }
  }

  static async rollbackUploadBatch(batchId, promotedKeys) {
    await deleteObjectKeys(promotedKeys).catch((error) => console.error('Failed to remove unassociated R2 media:', error));
    await prisma.mediaUploadBatch.update({ where: { id: batchId }, data: { consumedAt: null } }).catch(() => {});
  }

  static async deleteStoredMedia(media) {
    const keys = media.flatMap((item) => [item.storageKey, item.thumbnailStorageKey].filter(Boolean));
    if (keys.length) await deleteObjectKeys(keys);
  }

  static async cleanupExpiredBatches() {
    if (!s3Client) return;
    const now = new Date();
    const consumedBefore = new Date(now.getTime() - 60 * 60 * 1000);
    const batches = await prisma.mediaUploadBatch.findMany({
      where: {
        OR: [
          { expiresAt: { lt: now }, consumedAt: null },
          { consumedAt: { lt: consumedBefore } }
        ]
      },
      take: 100
    });

    for (const batch of batches) {
      try {
        await deleteObjectKeys(getManifestKeys(batch.manifest));
        await prisma.mediaUploadBatch.delete({ where: { id: batch.id } });
      } catch (error) {
        console.error('Failed to clean abandoned upload batch:', batch.id, error);
      }
    }
  }

  static async cleanupInactiveMedia() {
    if (!s3Client) return;
    const inactiveMedia = await prisma.media.findMany({ where: { isActive: false }, take: 100 });
    for (const media of inactiveMedia) {
      try {
        await this.deleteStoredMedia([media]);
        await prisma.media.delete({ where: { id: media.id } });
      } catch (error) {
        console.error('Failed to clean replaced property media:', media.id, error);
      }
    }
  }

  static async deleteMedia(mediaId, user) {
    const media = await prisma.media.findUnique({ where: { id: mediaId }, include: { property: true } });
    if (!media) throw ApiError.notFound('Media not found');
    if (user.role !== 'ADMIN' && media.property.ownerId !== user.id) {
      throw ApiError.forbidden('You are not authorized to delete this media');
    }
    const activeCount = await prisma.media.count({ where: { propertyId: media.propertyId, isActive: true } });
    if (activeCount <= 5) {
      throw ApiError.conflict('Replace the complete four-image and one-video set instead of deleting a required media item.');
    }
    await prisma.media.update({ where: { id: mediaId }, data: { isActive: false } });
    await this.cleanupInactiveMedia();
    return { success: true, message: 'Media deleted successfully' };
  }
}
