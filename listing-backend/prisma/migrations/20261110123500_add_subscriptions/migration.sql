CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PAID');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'REVOKED', 'FAILED');
CREATE TYPE "SubscriptionPaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');

CREATE TABLE "subscription_config" (
    "id" TEXT NOT NULL DEFAULT 'global_setting',
    "baseMonthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "freeValidityDays" INTEGER NOT NULL DEFAULT 30,
    "freeListingLimit" INTEGER NOT NULL DEFAULT 1,
    "freeMapUnlockLimit" INTEGER NOT NULL DEFAULT 1,
    "paidListingLimit" INTEGER NOT NULL DEFAULT 0,
    "paidMapUnlockLimit" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_config_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_config_freeValidityDays_check" CHECK ("freeValidityDays" > 0),
    CONSTRAINT "subscription_config_listingLimits_check" CHECK ("freeListingLimit" BETWEEN 0 AND 1 AND "paidListingLimit" >= 0),
    CONSTRAINT "subscription_config_mapLimits_check" CHECK ("freeMapUnlockLimit" BETWEEN 0 AND 1 AND "paidMapUnlockLimit" >= 0),
    CONSTRAINT "subscription_config_price_check" CHECK ("baseMonthlyPrice" >= 0)
);

INSERT INTO "subscription_config" ("id", "baseMonthlyPrice", "currency", "freeValidityDays", "freeListingLimit", "freeMapUnlockLimit", "paidListingLimit", "paidMapUnlockLimit", "updatedAt")
VALUES ('global_setting', 0, 'USD', 30, 1, 1, 0, 0, CURRENT_TIMESTAMP);

CREATE TABLE "subscription_discounts" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL DEFAULT 'global_setting',
    "minMonths" INTEGER NOT NULL,
    "maxMonths" INTEGER NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "subscription_discounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_discounts_months_check" CHECK ("minMonths" >= 1 AND "maxMonths" <= 48 AND "minMonths" <= "maxMonths"),
    CONSTRAINT "subscription_discounts_percent_check" CHECK ("discountPercent" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "subscription_discounts_configId_minMonths_maxMonths_key"
ON "subscription_discounts"("configId", "minMonths", "maxMonths");
CREATE INDEX "subscription_discounts_configId_minMonths_maxMonths_idx"
ON "subscription_discounts"("configId", "minMonths", "maxMonths");

INSERT INTO "subscription_discounts" ("id", "minMonths", "maxMonths", "discountPercent") VALUES
('discount-1-3-months', 1, 3, 0),
('discount-4-6-months', 4, 6, 5),
('discount-7-12-months', 7, 12, 10),
('discount-13-24-months', 13, 24, 15),
('discount-25-48-months', 25, 48, 20);

ALTER TABLE "subscription_discounts"
ADD CONSTRAINT "subscription_discounts_configId_fkey"
FOREIGN KEY ("configId") REFERENCES "subscription_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "durationMonths" INTEGER NOT NULL,
    "baseMonthlyPrice" DECIMAL(10,2) NOT NULL,
    "originalTotal" DECIMAL(10,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_durationMonths_check" CHECK (
        ("plan" = 'FREE' AND "durationMonths" = 0)
        OR ("plan" = 'PAID' AND "durationMonths" BETWEEN 1 AND 48)
    ),
    CONSTRAINT "subscriptions_amounts_check" CHECK ("baseMonthlyPrice" >= 0 AND "originalTotal" >= 0 AND "discountAmount" >= 0 AND "totalAmount" >= 0)
);

CREATE INDEX "subscriptions_userId_status_expiresAt_idx"
ON "subscriptions"("userId", "status", "expiresAt");

CREATE UNIQUE INDEX "subscriptions_one_pending_paid_per_user_key"
ON "subscriptions"("userId")
WHERE "plan" = 'PAID' AND "status" = 'PENDING_PAYMENT';

ALTER TABLE "subscriptions"
ADD CONSTRAINT "subscriptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "SubscriptionPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewaySessionId" TEXT,
    "gatewayReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_payments_amount_check" CHECK ("amount" >= 0)
);

CREATE UNIQUE INDEX "subscription_payments_gatewaySessionId_key"
ON "subscription_payments"("gatewaySessionId");
CREATE INDEX "subscription_payments_userId_status_idx"
ON "subscription_payments"("userId", "status");
CREATE INDEX "subscription_payments_subscriptionId_status_idx"
ON "subscription_payments"("subscriptionId", "status");

ALTER TABLE "subscription_payments"
ADD CONSTRAINT "subscription_payments_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_payments"
ADD CONSTRAINT "subscription_payments_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "subscription_map_unlocks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_map_unlocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_map_unlocks_subscriptionId_propertyId_key"
ON "subscription_map_unlocks"("subscriptionId", "propertyId");
CREATE INDEX "subscription_map_unlocks_userId_subscriptionId_idx"
ON "subscription_map_unlocks"("userId", "subscriptionId");

ALTER TABLE "subscription_map_unlocks"
ADD CONSTRAINT "subscription_map_unlocks_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_map_unlocks"
ADD CONSTRAINT "subscription_map_unlocks_subscriptionId_fkey"
FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscription_map_unlocks"
ADD CONSTRAINT "subscription_map_unlocks_propertyId_fkey"
FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
