import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePropertyLocation } from '../src/modules/properties/property.utils.js';

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

  await t.test('Reveals exact coordinates and address when user IS authorized (paid / admin)', () => {
    const revealed = sanitizePropertyLocation(mockProperty, true);

    assert.equal(revealed.isLocationLocked, false);
    assert.equal(revealed.exactAddress, 'Plot 14-16 Wanale Crescent, Mbale');
    assert.equal(revealed.latitude, 1.07842);
    assert.equal(revealed.longitude, 34.17581);
    assert.equal(revealed.directionsGuide, 'Take Republic St up Gangama hill');
  });
});
