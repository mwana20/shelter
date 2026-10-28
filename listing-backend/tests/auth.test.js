import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, verifyAgeRequirement } from '../src/utils/age.js';
import { validatePasswordStrength } from '../src/utils/password.js';

test('Auth Unit Tests: Age restriction rules', async (t) => {
  await t.test('Calculates age correctly for adult', () => {
    const dob = '1995-05-15';
    const age = calculateAge(dob);
    assert.ok(age >= 18);
  });

  await t.test('Rejects registration if user is under 18 years old', () => {
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

    const result = verifyAgeRequirement(sixteenYearsAgo, 18);
    assert.equal(result.isValid, false);
    assert.equal(result.message, 'You must be at least 18 years old to create an account.');
  });

  await t.test('Accepts registration if user is exactly or older than 18 years old', () => {
    const today = new Date();
    const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

    const result = verifyAgeRequirement(twentyYearsAgo, 18);
    assert.equal(result.isValid, true);
    assert.ok(result.age >= 18);
  });
});

test('Auth Unit Tests: Password complexity rules', async (t) => {
  await t.test('Rejects short passwords (<8 characters)', () => {
    const check = validatePasswordStrength('Ab1!');
    assert.equal(check.isValid, false);
  });

  await t.test('Rejects passwords missing uppercase', () => {
    const check = validatePasswordStrength('password123!');
    assert.equal(check.isValid, false);
  });

  await t.test('Rejects passwords missing special characters', () => {
    const check = validatePasswordStrength('Password123');
    assert.equal(check.isValid, false);
  });

  await t.test('Accepts strong passwords meeting all requirements', () => {
    const check = validatePasswordStrength('Sheltered2026!');
    assert.equal(check.isValid, true);
  });
});
