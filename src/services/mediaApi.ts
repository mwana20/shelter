import { API_BASE_URL, getAccessToken } from './authApi';

export type PropertyMediaKind = 'IMAGE' | 'VIDEO';

export interface MediaUploadLimits {
  imageCount: number;
  videoCount: number;
  imageTypes: string[];
  videoTypes: string[];
  maxImageSizeBytes: number;
  maxVideoSizeBytes: number;
  maxThumbnailSizeBytes: number;
}

export interface MediaUploadFileRequest {
  clientId: string;
  kind: PropertyMediaKind;
  mimeType: string;
  fileSize: number;
  thumbnail?: { mimeType: string; fileSize: number };
}

export interface PresignedMediaFile {
  clientId: string;
  kind: PropertyMediaKind;
  storageKey: string;
  uploadUrl: string;
  mimeType: string;
  thumbnailStorageKey: string | null;
  thumbnailUploadUrl: string | null;
  thumbnailMimeType: string | null;
}

export interface MediaUploadBatch {
  batchId: string;
  propertyId: string;
  expiresAt: string;
  files: PresignedMediaFile[];
}

export interface PropertyMediaRef {
  clientId: string;
  kind: PropertyMediaKind;
  storageKey: string;
  thumbnailStorageKey?: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...init?.headers
    },
    credentials: 'include'
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || result.data === undefined) {
    throw new Error(result?.message || 'Could not prepare property media upload.');
  }
  return result.data as T;
}

export const getMediaUploadLimits = (): Promise<MediaUploadLimits> =>
  apiRequest('/media/limits');

export const createMediaUploadBatch = (
  files: MediaUploadFileRequest[],
  propertyId?: string
): Promise<MediaUploadBatch> => apiRequest('/media/presigned-url', {
  method: 'POST',
  body: JSON.stringify({ files, ...(propertyId ? { propertyId } : {}) })
});

export const refreshMediaUploadUrls = (
  batchId: string,
  clientIds: string[]
): Promise<Pick<MediaUploadBatch, 'batchId' | 'expiresAt' | 'files'>> =>
  apiRequest(`/media/presigned-url/${encodeURIComponent(batchId)}/refresh`, {
    method: 'POST',
    body: JSON.stringify({ clientIds })
  });

export const uploadToR2 = (
  uploadUrl: string,
  file: Blob,
  mimeType: string,
  onProgress: (progress: number) => void
): Promise<void> => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('PUT', uploadUrl);
  request.setRequestHeader('Content-Type', mimeType);
  request.upload.onprogress = (event) => {
    if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
  };
  request.onerror = () => reject(new Error('Upload connection failed. Check the R2 bucket CORS settings and retry.'));
  request.onabort = () => reject(new Error('Upload was cancelled.'));
  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      onProgress(100);
      resolve();
    } else {
      reject(new Error(`R2 upload failed with status ${request.status}. Retry this file.`));
    }
  };
  request.send(file);
});