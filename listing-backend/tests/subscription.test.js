import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonths, SubscriptionService } from '../src/modules/subscriptions/subscription.service.js';

test('Subscription pricing calculations', async (t) => {
  const config = {
    baseMonthlyPrice: 100,
    discounts: [
      { minMonths: 1, maxMonths: 3, discountPercent: 0 },
      { minMonths: 4, maxMonths: 6, discountPercent: 5 },
      { minMonths: 7, maxMonths: 12, discountPercent: 10 },
      { minMonths: 13, maxMonths: 24, discountPercent: 15 },
      { minMonths: 25, maxMonths: 48, discountPercent: 20 }
    ]
  };

  await t.test('calculates increasing discounts for flexible durations', () => {
    assert.equal(SubscriptionService.calculatePrice(config, 1).totalAmount, 100);
    assert.equal(SubscriptionService.calculatePrice(config, 4).totalAmount, 380);
    assert.equal(SubscriptionService.calculatePrice(config, 12).totalAmount, 1080);
    assert.equal(SubscriptionService.calculatePrice(config, 48).totalAmount, 3840);
    assert.equal(SubscriptionService.calculatePrice(config, 48).effectiveMonthlyCost, 80);
  });

  await t.test('rejects durations outside 1-48 whole months', () => {
    assert.throws(() => SubscriptionService.calculatePrice(config, 0), { statusCode: 400 });
    assert.throws(() => SubscriptionService.calculatePrice(config, 49), { statusCode: 400 });
    assert.throws(() => SubscriptionService.calculatePrice(config, 1.5), { statusCode: 400 });
  });
});

test('Calendar month arithmetic handles month-end dates', () => {
  assert.equal(
    addCalendarMonths(new Date('2026-01-31T12:00:00.000Z'), 1).toISOString(),
    '2026-02-28T12:00:00.000Z'
  );
  assert.equal(
    addCalendarMonths(new Date('2024-01-31T12:00:00.000Z'), 1).toISOString(),
    '2024-02-29T12:00:00.000Z'
  );
});
