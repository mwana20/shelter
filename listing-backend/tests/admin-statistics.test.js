import test from 'node:test';
import assert from 'node:assert/strict';
import { getPropertyStatistics } from '../src/modules/admin/property-statistics.js';

test('Admin property statistics use database counts and the recent-listing window', async (t) => {
  const queries = [];
  const now = new Date('2026-04-15T00:00:00Z');
  const monthlyCounts = [
    { month: '2026-01', count: 2 },
    { month: '2026-03', count: 1 }
  ];
  const propertyModel = {
    async count(args) {
      queries.push(args);
      return [12, 3, 7, 4][queries.length - 1];
    }
  };
  const queryRaw = async (strings) => {
    assert.match(strings.join(' '), /DATE_TRUNC\('month'/);
    return monthlyCounts;
  };
  const statistics = await getPropertyStatistics(propertyModel, queryRaw, now);

  assert.deepEqual(statistics, {
    totalProperties: 12,
    soldProperties: 3,
    availableProperties: 7,
    newListings: 4,
    newListingsPeriodDays: 30,
    cumulativeListings: [
      { month: '2026-01', totalProperties: 2 },
      { month: '2026-02', totalProperties: 2 },
      { month: '2026-03', totalProperties: 3 },
      { month: '2026-04', totalProperties: 3 }
    ]
  });
  assert.equal(queries.length, 4);
  assert.equal(queries[0], undefined);
  assert.deepEqual(queries[1], { where: { status: 'SOLD' } });
  assert.deepEqual(queries[2], { where: { status: 'ACTIVE', listingType: 'SALE' } });
  const recentListingCutoff = queries[3].where.createdAt.gte.getTime();
  assert.equal(recentListingCutoff, now.getTime() - 30 * 24 * 60 * 60 * 1000);
});
