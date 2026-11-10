CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');

ALTER TABLE "property_media"
ADD COLUMN "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN "thumbnailStorageKey" TEXT,
ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "property_media_propertyId_isActive_idx"
ON "property_media"("propertyId", "isActive");

CREATE TABLE "media_upload_batches" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_upload_batches_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "media_upload_batches_ownerId_expiresAt_idx"
ON "media_upload_batches"("ownerId", "expiresAt");

CREATE INDEX "media_upload_batches_expiresAt_consumedAt_idx"
ON "media_upload_batches"("expiresAt", "consumedAt");

ALTER TABLE "media_upload_batches"
ADD CONSTRAINT "media_upload_batches_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;