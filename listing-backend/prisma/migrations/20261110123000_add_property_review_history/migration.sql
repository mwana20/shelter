ALTER TYPE "PropertyStatus" ADD VALUE 'CORRECTION_REQUESTED';

ALTER TABLE "properties"
ADD COLUMN "reviewNote" TEXT;

CREATE TABLE "property_reviews" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "PropertyStatus" NOT NULL,
    "toStatus" "PropertyStatus" NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "property_reviews_propertyId_createdAt_idx"
ON "property_reviews"("propertyId", "createdAt");

ALTER TABLE "property_reviews"
ADD CONSTRAINT "property_reviews_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "property_reviews"
ADD CONSTRAINT "property_reviews_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
