import test from 'node:test';
import assert from 'node:assert/strict';
import { updateProfileSchema } from '../src/modules/users/user.validation.js';
import { refreshSessionSchema, registerSchema } from '../src/validators/auth.schema.js';

test('User profile validation', async (t) => {
  await t.test('Accepts a compressed profile image and updated name', () => {
    const result = updateProfileSchema.safeParse({
      fullName: 'Alex Owner',
      avatarUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
    });

    assert.equal(result.success, true);
  });

  await t.test('Rejects unsupported profile image data', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: 'data:text/html;base64,PGgxPk5vdCBhbiBpbWFnZTwvaDE+'
    });

    assert.equal(result.success, false);
  });

  await t.test('Rejects malformed JPEG profile image data', () => {
    const result = updateProfileSchema.safeParse({
      avatarUrl: 'data:image/jpeg;base64,YWJj'
    });

    assert.equal(result.success, false);
  });

  await t.test('Rejects oversized and non-JPEG profile image data', () => {
    const oversized = updateProfileSchema.safeParse({
      avatarUrl: `data:image/jpeg;base64,${'A'.repeat(2_000_000)}`
    });
    const uncompressedType = updateProfileSchema.safeParse({
      avatarUrl: 'data:image/png;base64,iVBORw0KGgo='
    });

    assert.equal(oversized.success, false);
    assert.equal(uncompressedType.success, false);
  });
});

test('Registration accepts an optional validated profile photo', () => {
  const result = registerSchema.safeParse({
    fullName: 'Alex Owner',
    email: 'alex@example.com',
    dateOfBirth: '1990-01-01',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
    avatarUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
  });

  assert.equal(result.success, true);
});

test('Refresh session validation accepts cookie-based requests and validates legacy body tokens', () => {
  assert.equal(refreshSessionSchema.safeParse({}).success, true);
  assert.equal(refreshSessionSchema.safeParse({ refreshToken: 'refresh-token' }).success, true);
  assert.equal(refreshSessionSchema.safeParse({ refreshToken: '' }).success, false);
});
