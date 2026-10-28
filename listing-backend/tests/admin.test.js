import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewPaymentSchema, manualUnlockSchema } from '../src/validators/admin.schema.js';

test('Admin Validation Tests', async (t) => {
  const validUUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  await t.test('Approving payment does not require rejection reason', () => {
    const valid = reviewPaymentSchema.safeParse({
      action: 'APPROVE'
    });
    assert.equal(valid.success, true);
  });

  await t.test('Rejecting payment requires a mandatory rejection reason (min 5 chars)', () => {
    const invalid = reviewPaymentSchema.safeParse({
      action: 'REJECT'
    });
    assert.equal(invalid.success, false);

    const valid = reviewPaymentSchema.safeParse({
      action: 'REJECT',
      rejectionReason: 'Transaction ID not found in bank ledger.'
    });
    assert.equal(valid.success, true);
  });

  await t.test('Manual support unlock requires valid recipient email and audit reason (min 8 chars)', () => {
    const valid = manualUnlockSchema.safeParse({
      propertyId: validUUID,
      userEmail: 'client@example.com',
      reason: 'Customer service resolution for offline wire transfer #88419'
    });
    assert.equal(valid.success, true);

    const invalid = manualUnlockSchema.safeParse({
      propertyId: validUUID,
      userEmail: 'client@example.com',
      reason: 'Short'
    });
    assert.equal(invalid.success, false);
  });
});
