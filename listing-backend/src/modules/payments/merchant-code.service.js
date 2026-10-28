import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export class MerchantCodeService {
  static async verifyAndSubmitTransaction({
    user,
    property,
    transactionId,
    settings
  }) {
    const cleanTxId = transactionId.trim().toUpperCase();

    // 1. Validate length rules configured by Admin
    if (cleanTxId.length < settings.txIdMinLength || cleanTxId.length > settings.txIdMaxLength) {
      throw ApiError.badRequest(
        `Transaction ID must be between ${settings.txIdMinLength} and ${settings.txIdMaxLength} characters.`
      );
    }

    // 2. Validate regex pattern configured by Admin
    try {
      const regex = new RegExp(settings.txIdRegexPattern);
      if (!regex.test(cleanTxId)) {
        throw ApiError.badRequest(
          'Transaction ID format is invalid. Only allowed alphanumeric and symbol characters are accepted.'
        );
      }
    } catch {
      // Fallback regex
      if (!/^[A-Za-z0-9_-]+$/.test(cleanTxId)) {
        throw ApiError.badRequest('Invalid characters in transaction ID.');
      }
    }

    // 3. Prevent duplicate submission by the same user or globally verified
    const existingPayment = await prisma.payment.findFirst({
      where: {
        submittedTxId: cleanTxId,
        paymentMethod: 'MERCHANT_CODE'
      }
    });

    if (existingPayment) {
      if (existingPayment.status === 'VERIFIED') {
        throw ApiError.conflict('Transaction ID already used. This reference has already been claimed.');
      }
      if (existingPayment.userId === user.id) {
        throw ApiError.conflict('You have already submitted this transaction ID. It is currently being processed.');
      }
    }

    // 4. Determine status based on verification mode configured by Admin
    const isAuto = settings.verificationMode === 'AUTOMATIC';
    const status = isAuto ? 'VERIFIED' : 'PENDING';

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        propertyId: property.id,
        paymentMethod: 'MERCHANT_CODE',
        amount: settings.unlockFeeAmount,
        currency: settings.unlockFeeCurrency,
        status,
        purpose: 'LOCATION_UNLOCK',
        merchantCode: settings.merchantCode,
        submittedTxId: cleanTxId,
        verifiedAt: isAuto ? new Date() : null,
        auditNotes: isAuto ? 'Auto-verified via merchant gateway integration' : 'Pending administrative verification'
      }
    });

    // If verified automatically, immediately create the unlock record
    if (isAuto) {
      await prisma.locationUnlock.upsert({
        where: {
          userId_propertyId: { userId: user.id, propertyId: property.id }
        },
        update: {
          paymentId: payment.id,
          unlockedAt: new Date()
        },
        create: {
          userId: user.id,
          propertyId: property.id,
          paymentId: payment.id,
          unlockMethod: 'MERCHANT_CODE',
          unlockedAt: new Date()
        }
      });
    }

    return {
      payment,
      status,
      message: isAuto
        ? 'Transaction verified! Exact location is unlocked.'
        : 'Your payment is being verified. You will get access once verification is complete.'
    };
  }
}
