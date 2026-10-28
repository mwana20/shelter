-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('GATEWAY_STRIPE', 'MERCHANT_CODE', 'MANUAL_ADMIN_OVERRIDE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'DUPLICATE', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationMode" AS ENUM ('AUTOMATIC', 'MANUAL_ADMIN_REVIEW');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "country" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "agencyLicense" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "listingType" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(3,1),
    "landSizeSqFt" DECIMAL(12,2),
    "builtYear" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT,
    "exactAddress" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "directionsGuide" TEXT,
    "cadastralPlotNumber" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_lock_overrides" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "customFee" DECIMAL(10,2),
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_lock_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_lock_settings" (
    "id" TEXT NOT NULL DEFAULT 'global_setting',
    "enabledGlobally" BOOLEAN NOT NULL DEFAULT false,
    "unlockFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    "unlockFeeCurrency" TEXT NOT NULL DEFAULT 'USD',
    "gatewayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "merchantCodeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "merchantCode" TEXT NOT NULL DEFAULT 'SHELTER-MBL-784',
    "merchantName" TEXT NOT NULL DEFAULT 'Sheltered Global Escrow Services Ltd',
    "paymentInstructions" TEXT NOT NULL,
    "supportedChannels" TEXT[] DEFAULT ARRAY['MTN Mobile Money', 'Airtel Money', 'Stanbic FlexiPay', 'Bank Wire']::TEXT[],
    "txIdMinLength" INTEGER NOT NULL DEFAULT 6,
    "txIdMaxLength" INTEGER NOT NULL DEFAULT 30,
    "txIdRegexPattern" TEXT NOT NULL DEFAULT '^[A-Za-z0-9_-]+$',
    "verificationMode" "VerificationMode" NOT NULL DEFAULT 'AUTOMATIC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_lock_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT NOT NULL DEFAULT 'LOCATION_UNLOCK',
    "gatewaySessionId" TEXT,
    "gatewayReference" TEXT,
    "gatewayReceiptUrl" TEXT,
    "merchantCode" TEXT,
    "submittedTxId" TEXT,
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedByAdminId" TEXT,
    "auditNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_unlocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "paymentId" TEXT,
    "unlockMethod" "PaymentMethod" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "property_lock_overrides_propertyId_key" ON "property_lock_overrides"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewaySessionId_key" ON "payments"("gatewaySessionId");

-- CreateIndex
CREATE INDEX "payments_userId_status_idx" ON "payments"("userId", "status");

-- CreateIndex
CREATE INDEX "payments_propertyId_status_idx" ON "payments"("propertyId", "status");

-- CreateIndex
CREATE INDEX "payments_submittedTxId_idx" ON "payments"("submittedTxId");

-- CreateIndex
CREATE UNIQUE INDEX "location_unlocks_paymentId_key" ON "location_unlocks"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "location_unlocks_userId_propertyId_key" ON "location_unlocks"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_media_storageKey_key" ON "property_media"("storageKey");

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_lock_overrides" ADD CONSTRAINT "property_lock_overrides_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_unlocks" ADD CONSTRAINT "location_unlocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_unlocks" ADD CONSTRAINT "location_unlocks_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_unlocks" ADD CONSTRAINT "location_unlocks_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
