ALTER TABLE "verification_tokens"
ADD COLUMN "codeExpiresAt" TIMESTAMP(3);

UPDATE "verification_tokens"
SET "codeExpiresAt" = "createdAt" + INTERVAL '1 minute';
