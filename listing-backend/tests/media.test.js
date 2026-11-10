import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaRefsSchema, presignedUrlSchema } from '../src/modules/media/media.validation.js';

const validUploadFiles = () => [
  ...Array.from({ length: 4 }, (_, index) => ({
    clientId: `image-${index + 1}`,
    kind: 'IMAGE',
    mimeType: 'image/webp',
    fileSize: 400_000,
    thumbnail: { mimeType: 'image/webp', fileSize: 40_000 }
  })),
  {
    clientId: 'property-video',
    kind: 'VIDEO',
    mimeType: 'video/mp4',
    fileSize: 10_000_000
  }
];

test('Property media upload manifest validation', async (t) => {
  await t.test('accepts exactly four supported images and one MP4 video', () => {
    const result = presignedUrlSchema.safeParse({ files: validUploadFiles() });
    assert.equal(result.success, true);
  });

  await t.test('rejects a manifest with the wrong number of image or video files', () => {
    const files = validUploadFiles().slice(1);
    assert.equal(presignedUrlSchema.safeParse({ files }).success, false);
  });

  await t.test('rejects unsupported image and video MIME types', () => {
    const badImage = validUploadFiles();
    badImage[0].mimeType = 'image/gif';
    assert.equal(presignedUrlSchema.safeParse({ files: badImage }).success, false);

    const badVideo = validUploadFiles();
    badVideo[4].mimeType = 'video/quicktime';
    assert.equal(presignedUrlSchema.safeParse({ files: badVideo }).success, false);
  });

  await t.test('allows an optional JPEG/WebP poster for the MP4 video', () => {
    const withPoster = validUploadFiles();
    withPoster[4].thumbnail = { mimeType: 'image/jpeg', fileSize: 24_000 };
    assert.equal(presignedUrlSchema.safeParse({ files: withPoster }).success, true);

    withPoster[4].thumbnail.mimeType = 'image/gif';
    assert.equal(presignedUrlSchema.safeParse({ files: withPoster }).success, false);
  });

  await t.test('rejects missing image thumbnails and duplicate client IDs', () => {
    const withoutThumbnail = validUploadFiles();
    delete withoutThumbnail[0].thumbnail;
    assert.equal(presignedUrlSchema.safeParse({ files: withoutThumbnail }).success, false);

    const duplicateId = validUploadFiles();
    duplicateId[1].clientId = duplicateId[0].clientId;
    assert.equal(presignedUrlSchema.safeParse({ files: duplicateId }).success, false);
  });
});

test('Property media reference validation', () => {
  const refs = [
    ...Array.from({ length: 4 }, (_, index) => ({
      clientId: `image-${index + 1}`,
      kind: 'IMAGE',
      storageKey: `staging/user/batch/image-${index + 1}/file-${index}.webp`,
      thumbnailStorageKey: `staging/user/batch/image-${index + 1}/thumb-${index}.webp`
    })),
    {
      clientId: 'property-video',
      kind: 'VIDEO',
      storageKey: 'staging/user/batch/property-video/file.mp4'
    }
  ];
  assert.equal(mediaRefsSchema.safeParse(refs).success, true);
  assert.equal(mediaRefsSchema.safeParse(refs.slice(0, 4)).success, false);
});