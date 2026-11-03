import test from 'node:test';
import assert from 'node:assert/strict';
import { updateProfileSchema } from '../src/modules/users/user.validation.js';
import { refreshSessionSchema } from '../src/validators/auth.schema.js';

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
});

test('Refresh session validation requires a token', () => {
  assert.equal(refreshSessionSchema.safeParse({ refreshToken: 'refresh-token' }).success, true);
  assert.equal(refreshSessionSchema.safeParse({ refreshToken: '' }).success, false);
});
