import test from 'node:test';
import assert from 'node:assert/strict';
import { submitMerchantTransactionSchema } from '../src/validators/payment.schema.js';

test('Payment Transaction Validation Tests', async (t) => {
  const validUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  await t.test('Accepts valid transaction ID format', () => {
    const valid = submitMerchantTransactionSchema.safeParse({
      propertyId: validUUID,
      transactionId: 'TXN-884920_MBL'
    });
    assert.equal(valid.success, true);
  });

  await t.test('Rejects short transaction IDs (< 6 chars)', () => {
    const invalid = submitMerchantTransactionSchema.safeParse({
      propertyId: validUUID,
      transactionId: 'TX1'
    });
    assert.equal(invalid.success, false);
  });

  await t.test('Rejects transaction IDs with special illegal symbols', () => {
    const invalid = submitMerchantTransactionSchema.safeParse({
      propertyId: validUUID,
      transactionId: 'TXN#992$*!'
    });
    assert.equal(invalid.success, false);
  });
});
