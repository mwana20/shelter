import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, RefreshCw, Trash2, Upload, Video } from 'lucide-react';
import {
  createMediaUploadBatch,
  getMediaUploadLimits,
  MediaUploadBatch,
  MediaUploadLimits,
  MediaUploadFileRequest,
  PresignedMediaFile,
  PropertyMediaRef,
  refreshMediaUploadUrls,
  uploadToR2
} from '../services/mediaApi';

type UploadStatus = 'empty' | 'selected' | 'uploading' | 'uploaded' | 'failed';
const THUMBNAIL_TYPES = ['image/jpeg', 'image/webp'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getFileMimeType(file: File, kind: UploadSlot['kind']) {
  if (file.type) return file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (kind === 'VIDEO' && extension === 'mp4') return 'video/mp4';
  if (kind === 'IMAGE') {
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
    if (extension === 'png') return 'image/png';
    if (extension === 'webp') return 'image/webp';
  }
  return '';
}

type UploadSlot = {
  clientId: string;
  kind: 'IMAGE' | 'VIDEO';
  file: File | null;
  previewUrl: string | null;
  uploadFile: Blob | null;
  uploadMimeType: string | null;
  thumbnail: Blob | null;
  thumbnailMimeType: string | null;
  presigned: PresignedMediaFile | null;
  status: UploadStatus;
  progress: number;
  error: string | null;
};

export interface UploadedMediaSelection {
  batchId: string;
  propertyId: string;
  mediaRefs: PropertyMediaRef[];
}

interface PropertyMediaUploaderProps {
  onUploadChange: (selection: UploadedMediaSelection | null) => void;
}

const createInitialSlots = (): UploadSlot[] => [
  ...Array.from({ length: 4 }, (_, index) => ({
    clientId: `image-${index + 1}`,
    kind: 'IMAGE' as const,
    file: null,
    previewUrl: null,
    uploadFile: null,
    uploadMimeType: null,
    thumbnail: null,
    thumbnailMimeType: null,
    presigned: null,
    status: 'empty' as const,
    progress: 0,
    error: null
  })),
  {
    clientId: 'property-video',
    kind: 'VIDEO' as const,
    file: null,
    previewUrl: null,
    uploadFile: null,
    uploadMimeType: null,
    thumbnail: null,
    thumbnailMimeType: null,
    presigned: null,
    status: 'empty' as const,
    progress: 0,
    error: null
  }
];

function makePreviewBlob(source: ImageBitmap, maxEdge: number, quality: number, mimeType = 'image/webp'): Promise<Blob> {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    source.close();
    return Promise.reject(new Error('This browser cannot process image previews.'));
  }
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  source.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not optimize this image. Try another image.'));
    }, mimeType, quality);
  });
}

async function optimizeImage(file: File, maxImageSize: number, maxThumbnailSize: number) {
  const bitmap = await createImageBitmap(file);
  const full = await makePreviewBlob(bitmap, 1920, 0.84);
  if (full.size > maxImageSize) throw new Error(`Optimized image exceeds the ${formatBytes(maxImageSize)} limit.`);

  const thumbnailBitmap = await createImageBitmap(file);
  let thumbnail = await makePreviewBlob(thumbnailBitmap, 480, 0.78);
  if (!THUMBNAIL_TYPES.includes(thumbnail.type)) {
    const jpegBitmap = await createImageBitmap(file);
    thumbnail = await makePreviewBlob(jpegBitmap, 480, 0.78, 'image/jpeg');
  }
  if (thumbnail.size > maxThumbnailSize) throw new Error(`Image thumbnail exceeds the ${formatBytes(maxThumbnailSize)} limit.`);

  return { full, thumbnail, mimeType: full.type || 'image/webp', thumbnailMimeType: thumbnail.type || 'image/webp' };
}

async function createVideoPoster(file: File): Promise<Blob | null> {
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);
  video.preload = 'metadata';
  video.muted = true;
  video.src = objectUrl;

  return new Promise((resolve) => {
    let finished = false;
    const finish = (poster: Blob | null) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
      resolve(poster);
    };
    const renderFrame = () => {
      const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) return finish(null);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => finish(blob), 'image/jpeg', 0.76);
    };
    const timeout = window.setTimeout(() => finish(null), 8000);
    video.onloadedmetadata = () => {
      if (video.duration > 0) video.currentTime = Math.min(1, video.duration / 4);
    };
    video.onseeked = renderFrame;
    video.onerror = () => finish(null);
  });
}

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(0)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

export const PropertyMediaUploader: React.FC<PropertyMediaUploaderProps> = ({ onUploadChange }) => {
  const [assets, setAssets] = useState<UploadSlot[]>(createInitialSlots);
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const [limits, setLimits] = useState<MediaUploadLimits | null>(null);
  const [batch, setBatch] = useState<MediaUploadBatch | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    getMediaUploadLimits().then(setLimits).catch((error: unknown) => {
      setFormError(error instanceof Error ? error.message : 'Could not load upload limits.');
    });
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const updateAsset = (clientId: string, patch: Partial<UploadSlot>) => {
    const updated = assetsRef.current.map((asset) => asset.clientId === clientId ? { ...asset, ...patch } : asset);
    assetsRef.current = updated;
    setAssets(updated);
  };

  const invalidateBatch = () => {
    setBatch(null);
    setFormError(null);
    onUploadChange(null);
    const resetAssets = assetsRef.current.map((asset) => ({
      ...asset,
      uploadFile: null,
      uploadMimeType: null,
      thumbnail: null,
      thumbnailMimeType: null,
      presigned: null,
      status: asset.file ? 'selected' as const : 'empty' as const,
      progress: 0,
      error: null
    }));
    assetsRef.current = resetAssets;
    setAssets(resetAssets);
  };

  const releasePreview = (url: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
  };

  const selectFile = (clientId: string, file?: File) => {
    if (isUploading) return;
    const slot = assetsRef.current.find((asset) => asset.clientId === clientId);
    if (!slot) return;
    invalidateBatch();
    releasePreview(slot.previewUrl);

    if (!file) {
      updateAsset(clientId, { file: null, previewUrl: null, status: 'empty', error: null });
      return;
    }

    const isImage = slot.kind === 'IMAGE';
    const fileMimeType = getFileMimeType(file, slot.kind);
    const allowedTypes = isImage ? limits?.imageTypes || IMAGE_TYPES : limits?.videoTypes || ['video/mp4'];
    const maxSize = isImage ? limits?.maxImageSizeBytes : limits?.maxVideoSizeBytes;
    if (!allowedTypes.includes(fileMimeType)) {
      updateAsset(clientId, { file: null, previewUrl: null, status: 'empty', error: isImage ? 'Choose a JPEG, PNG, or WebP image.' : 'Choose an MP4 video.' });
      return;
    }
    if (maxSize && file.size > maxSize) {
      updateAsset(clientId, { file: null, previewUrl: null, status: 'empty', error: `File exceeds the ${formatBytes(maxSize)} limit.` });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.add(previewUrl);
    updateAsset(clientId, { file, previewUrl, status: 'selected', progress: 0, error: null });
  };

  const buildUploadFiles = async (): Promise<{ descriptors: MediaUploadFileRequest[]; prepared: Map<string, { file: Blob; mimeType: string; thumbnail: Blob | null; thumbnailMimeType: string | null }> }> => {
    if (!limits) throw new Error('Upload limits are still loading. Please retry shortly.');
    const selected = assetsRef.current;
    if (selected.some((asset) => !asset.file)) throw new Error('Select exactly four property images and one MP4 video.');

    const prepared = new Map<string, { file: Blob; mimeType: string; thumbnail: Blob | null; thumbnailMimeType: string | null }>();
    const descriptors: MediaUploadFileRequest[] = [];
    for (const asset of selected) {
      const file = asset.file!;
      if (asset.kind === 'IMAGE') {
        if (!limits.imageTypes.includes(getFileMimeType(file, 'IMAGE'))) throw new Error('Images must be JPEG, PNG, or WebP.');
        if (file.size > limits.maxImageSizeBytes) throw new Error(`Each image must be no larger than ${formatBytes(limits.maxImageSizeBytes)}.`);
        const optimized = await optimizeImage(file, limits.maxImageSizeBytes, limits.maxThumbnailSizeBytes);
        prepared.set(asset.clientId, { file: optimized.full, mimeType: optimized.mimeType, thumbnail: optimized.thumbnail, thumbnailMimeType: optimized.thumbnailMimeType });
        descriptors.push({
          clientId: asset.clientId,
          kind: 'IMAGE',
          mimeType: optimized.mimeType,
          fileSize: optimized.full.size,
          thumbnail: { mimeType: optimized.thumbnailMimeType, fileSize: optimized.thumbnail.size }
        });
      } else {
        if (getFileMimeType(file, 'VIDEO') !== 'video/mp4') throw new Error('The property walkthrough must be an MP4 video.');
        if (file.size > limits.maxVideoSizeBytes) throw new Error(`The video must be no larger than ${formatBytes(limits.maxVideoSizeBytes)}.`);
        const poster = await createVideoPoster(file);
        const usePoster = poster && poster.size <= limits.maxThumbnailSizeBytes ? poster : null;
        prepared.set(asset.clientId, {
          file,
          mimeType: 'video/mp4',
          thumbnail: usePoster,
          thumbnailMimeType: usePoster ? 'image/jpeg' : null
        });
        descriptors.push({
          clientId: asset.clientId,
          kind: 'VIDEO',
          mimeType: 'video/mp4',
          fileSize: file.size,
          ...(usePoster ? { thumbnail: { mimeType: 'image/jpeg', fileSize: usePoster.size } } : {})
        });
      }
    }
    return { descriptors, prepared };
  };

  const uploadOne = async (
    clientId: string,
    signedFile: PresignedMediaFile,
    prepared: { file: Blob; mimeType: string; thumbnail: Blob | null; thumbnailMimeType: string | null }
  ) => {
    updateAsset(clientId, { status: 'uploading', progress: 0, error: null, presigned: signedFile });
    try {
      const hasThumbnail = Boolean(prepared.thumbnail && signedFile.thumbnailUploadUrl);
      await uploadToR2(signedFile.uploadUrl, prepared.file, prepared.mimeType, (progress) => {
        updateAsset(clientId, { progress: Math.round(progress * (hasThumbnail ? 0.8 : 1)) });
      });
      if (prepared.thumbnail && signedFile.thumbnailUploadUrl && prepared.thumbnailMimeType) {
        await uploadToR2(signedFile.thumbnailUploadUrl, prepared.thumbnail, prepared.thumbnailMimeType, (progress) => {
          updateAsset(clientId, { progress: 80 + Math.round(progress * 0.2) });
        });
      }
      updateAsset(clientId, { status: 'uploaded', progress: 100 });
      return true;
    } catch (error) {
      updateAsset(clientId, { status: 'failed', error: error instanceof Error ? error.message : 'Upload failed.' });
      return false;
    }
  };

  const publishSelectionIfReady = (currentBatch: MediaUploadBatch) => {
    const completed = assetsRef.current.filter((asset) => asset.status === 'uploaded');
    if (completed.length !== 5) {
      onUploadChange(null);
      return;
    }
    onUploadChange({
      batchId: currentBatch.batchId,
      propertyId: currentBatch.propertyId,
      mediaRefs: completed.map((asset) => ({
        clientId: asset.clientId,
        kind: asset.kind,
        storageKey: asset.presigned!.storageKey,
        ...(asset.presigned?.thumbnailStorageKey ? { thumbnailStorageKey: asset.presigned.thumbnailStorageKey } : {})
      }))
    });
  };

  const startUploads = async () => {
    setIsUploading(true);
    setFormError(null);
    onUploadChange(null);
    try {
      const { descriptors, prepared } = await buildUploadFiles();
      const uploadBatch = await createMediaUploadBatch(descriptors);
      setBatch(uploadBatch);
      const current = assetsRef.current.map((asset) => ({
        ...asset,
        uploadFile: prepared.get(asset.clientId)?.file || null,
        uploadMimeType: prepared.get(asset.clientId)?.mimeType || null,
        thumbnail: prepared.get(asset.clientId)?.thumbnail || null,
        thumbnailMimeType: prepared.get(asset.clientId)?.thumbnailMimeType || null,
        presigned: uploadBatch.files.find((file) => file.clientId === asset.clientId) || null,
        status: 'selected' as const,
        progress: 0,
        error: null
      }));
      assetsRef.current = current;
      setAssets(current);

      let nextIndex = 0;
      await Promise.all(Array.from({ length: 2 }, async () => {
        while (nextIndex < current.length) {
          const asset = current[nextIndex++];
          const signed = uploadBatch.files.find((file) => file.clientId === asset.clientId)!;
          const ready = prepared.get(asset.clientId)!;
          await uploadOne(asset.clientId, signed, ready);
        }
      }));
      publishSelectionIfReady(uploadBatch);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not prepare uploads.');
    } finally {
      setIsUploading(false);
    }
  };

  const retryUpload = async (clientId: string) => {
    if (!batch) return;
    const asset = assetsRef.current.find((item) => item.clientId === clientId);
    if (!asset?.uploadFile || !asset.uploadMimeType) return;
    setIsUploading(true);
    setFormError(null);
    try {
      const refreshed = await refreshMediaUploadUrls(batch.batchId, [clientId]);
      const signedFile = refreshed.files[0];
      const succeeded = await uploadOne(clientId, signedFile, {
        file: asset.uploadFile,
        mimeType: asset.uploadMimeType,
        thumbnail: asset.thumbnail,
        thumbnailMimeType: asset.thumbnailMimeType
      });
      if (succeeded) {
        const updatedBatch = { ...batch, expiresAt: refreshed.expiresAt };
        setBatch(updatedBatch);
        publishSelectionIfReady(updatedBatch);
      }
    } catch (error) {
      updateAsset(clientId, { status: 'failed', error: error instanceof Error ? error.message : 'Retry failed.' });
      onUploadChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedCount = assets.filter((asset) => asset.file).length;
  const allUploaded = Boolean(batch && assets.length === 5 && assets.every((asset) => asset.status === 'uploaded'));
  const imageSlots = assets.filter((asset) => asset.kind === 'IMAGE');
  const videoSlot = assets.find((asset) => asset.kind === 'VIDEO')!;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">Property images</h3>
        <p className="mt-1 text-xs text-slate-500">
          Add exactly four JPEG, PNG, or WebP images. Images are resized and optimized before direct upload.
          {limits && ` Maximum ${formatBytes(limits.maxImageSizeBytes)} each.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {imageSlots.map((asset, index) => (
          <div key={asset.clientId} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="relative aspect-[4/3] bg-slate-100">
              {asset.previewUrl ? (
                <img src={asset.previewUrl} alt={`Property image ${index + 1} preview`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                  <ImagePlus className="h-7 w-7" />
                  <span className="text-xs">Image {index + 1}</span>
                </div>
              )}
              {asset.file && (
                <button
                  type="button"
                  onClick={() => selectFile(asset.clientId)}
                  disabled={isUploading}
                  aria-label={`Remove image ${index + 1}`}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="min-w-0 truncate text-xs font-medium text-slate-700">{asset.file?.name || `Image ${index + 1}`}</span>
              <label className={`shrink-0 text-xs font-semibold ${isUploading ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-900 hover:underline'}`}>
                {asset.file ? 'Replace' : 'Choose image'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(event) => {
                    selectFile(asset.clientId, event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
            {asset.error && <p role="alert" className="px-3 pb-3 text-xs text-rose-700">{asset.error}</p>}
            {(asset.status === 'uploading' || asset.status === 'uploaded' || asset.status === 'failed') && (
              <div className="border-t border-slate-100 px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={asset.status === 'failed' ? 'text-rose-700' : 'text-slate-600'}>
                    {asset.status === 'uploading' ? 'Uploading image and thumbnail' : asset.status === 'uploaded' ? 'Uploaded' : asset.error}
                  </span>
                  {asset.status === 'failed' && (
                    <button type="button" onClick={() => void retryUpload(asset.clientId)} disabled={isUploading} className="inline-flex shrink-0 items-center gap-1 font-semibold text-slate-900 disabled:opacity-50">
                      <RefreshCw className="h-3.5 w-3.5" /> Retry
                    </button>
                  )}
                </div>
                <progress className="mt-2 h-1.5 w-full accent-slate-900" max={100} value={asset.progress} aria-label={`Image ${index + 1} upload progress`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-base font-bold text-slate-900">Property walkthrough video</h3>
        <p className="mt-1 text-xs text-slate-500">
          Add one MP4 video.{limits && ` Maximum ${formatBytes(limits.maxVideoSizeBytes)}.`}
        </p>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="relative aspect-video bg-slate-950">
            {videoSlot.previewUrl ? (
              <video src={videoSlot.previewUrl} controls preload="metadata" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <Video className="h-8 w-8" />
                <span className="text-xs">MP4 video preview</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <span className="min-w-0 truncate text-xs font-medium text-slate-700">{videoSlot.file?.name || 'No video selected'}</span>
            <div className="flex items-center gap-3">
              {videoSlot.file && (
                <button type="button" onClick={() => selectFile(videoSlot.clientId)} disabled={isUploading} aria-label="Remove video" className="text-slate-500 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <label className={`text-xs font-semibold ${isUploading ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-900 hover:underline'}`}>
                {videoSlot.file ? 'Replace video' : 'Choose MP4'}
                <input
                  type="file"
                  accept=".mp4,video/mp4"
                  className="sr-only"
                  disabled={isUploading}
                  onChange={(event) => {
                    selectFile(videoSlot.clientId, event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          </div>
          {videoSlot.error && <p role="alert" className="px-3 pb-3 text-xs text-rose-700">{videoSlot.error}</p>}
          {(videoSlot.status === 'uploading' || videoSlot.status === 'uploaded' || videoSlot.status === 'failed') && (
            <div className="border-t border-slate-100 px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={videoSlot.status === 'failed' ? 'text-rose-700' : 'text-slate-600'}>
                  {videoSlot.status === 'uploading' ? 'Uploading video' : videoSlot.status === 'uploaded' ? 'Uploaded' : videoSlot.error}
                </span>
                {videoSlot.status === 'failed' && (
                  <button type="button" onClick={() => void retryUpload(videoSlot.clientId)} disabled={isUploading} className="inline-flex shrink-0 items-center gap-1 font-semibold text-slate-900 disabled:opacity-50">
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                )}
              </div>
              <progress className="mt-2 h-1.5 w-full accent-slate-900" max={100} value={videoSlot.progress} aria-label="Video upload progress" />
            </div>
          )}
        </div>
      </div>

      {formError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{formError}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <span className="text-xs text-slate-500">{selectedCount} of 5 required files selected</span>
        <div className="flex flex-wrap items-center gap-3">
          {allUploaded && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />All files uploaded</span>}
          {!allUploaded && (
            <button
              type="button"
              onClick={() => void startUploads()}
              disabled={isUploading || !limits || selectedCount !== 5}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {batch ? 'Retry failed uploads' : 'Upload selected files'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};