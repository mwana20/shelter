import test from 'node:test';
import assert from 'node:assert/strict';
import { canViewProperty, sanitizePropertyLocation } from '../src/modules/properties/property.utils.js';
import { uuidParamSchema } from '../src/validators/common.schema.js';
import { submitMerchantTransactionSchema } from '../src/validators/payment.schema.js';

test('Property Location Withholding Tests', async (t) => {
  const mockProperty = {
    id: 'prop-123',
    title: 'Executive Villa in Senior Quarters',
    district: 'Mbale',
    country: 'Uganda',
    exactAddress: 'Plot 14-16 Wanale Crescent, Mbale',
    latitude: 1.07842,
    longitude: 34.17581,
    directionsGuide: 'Take Republic St up Gangama hill',
    cadastralPlotNumber: 'FRV-MBL-4491'
  };

  await t.test('Withholds exact coordinates and address when user is NOT authorized', () => {
    const sanitized = sanitizePropertyLocation(mockProperty, false);

    assert.equal(sanitized.isLocationLocked, true);
    assert.equal(sanitized.exactAddress, null);
    assert.equal(sanitized.latitude, null);
    assert.equal(sanitized.longitude, null);
    assert.equal(sanitized.directionsGuide, null);
    assert.equal(sanitized.cadastralPlotNumber, null);
    assert.equal(sanitized.district, 'Mbale'); // public area remains visible
    assert.ok(sanitized.lockNotice.includes('Exact location is locked'));
  });

  test('Property review visibility', async (t) => {
    const pending = { id: 'pending-1', ownerId: 'owner-1', status: 'PENDING_REVIEW' };
    const rejected = { ...pending, status: 'REJECTED' };
    const approved = { ...pending, status: 'ACTIVE' };

    await t.test('hides pending and rejected properties from public users', () => {
      assert.equal(canViewProperty(pending, null), false);
      assert.equal(canViewProperty(rejected, null), false);
    });

    await t.test('allows approved listings and authorized owner/admin review', () => {
      assert.equal(canViewProperty(approved, null), true);
      assert.equal(canViewProperty(pending, { id: 'owner-1', role: 'SELLER' }), true);
      assert.equal(canViewProperty(rejected, { id: 'admin-1', role: 'ADMIN' }), true);
    });
  });

  await t.test('Reveals exact coordinates and address when user IS authorized (paid / admin)', () => {
    const revealed = sanitizePropertyLocation(mockProperty, true);

    assert.equal(revealed.isLocationLocked, false);
    assert.equal(revealed.exactAddress, 'Plot 14-16 Wanale Crescent, Mbale');
    assert.equal(revealed.latitude, 1.07842);
    assert.equal(revealed.longitude, 34.17581);
    assert.equal(revealed.directionsGuide, 'Take Republic St up Gangama hill');
  });

  await t.test('Accepts real application IDs instead of requiring UUIDs', () => {
    const parsedParam = uuidParamSchema.parse({ id: 'prop-mbale-1' });
    const parsedPayment = submitMerchantTransactionSchema.parse({
      propertyId: 'prop-mbale-1',
      transactionId: 'TX-123_ABC'
    });

    assert.equal(parsedParam.id, 'prop-mbale-1');
    assert.equal(parsedPayment.propertyId, 'prop-mbale-1');
    assert.equal(parsedPayment.transactionId, 'TX-123_ABC');
  });
});
