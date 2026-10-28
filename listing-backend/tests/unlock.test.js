import test from 'node:test';
import assert from 'node:assert/strict';
import { unlockPropertyParamSchema } from '../src/modules/unlocks/unlock.validation.js';

test('Unlock Validation Tests', async (t) => {
  await t.test('Validates UUID property parameter', () => {
    const valid = unlockPropertyParamSchema.safeParse({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    });
    assert.equal(valid.success, true);
  });

  await t.test('Fails on invalid UUID format', () => {
    const invalid = unlockPropertyParamSchema.safeParse({
      propertyId: 'not-a-valid-uuid'
    });
    assert.equal(invalid.success, false);
  });
});
