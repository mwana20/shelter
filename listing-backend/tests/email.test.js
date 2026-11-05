import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../src/config/env.js';
import { sendEmail } from '../src/modules/notifications/email.service.js';

test('sendEmail sends existing email payloads through Mailjet', async () => {
  const originalFetch = globalThis.fetch;
  const originalMailjet = { ...env.MAILJET };
  const originalNodeEnv = env.NODE_ENV;

  try {
    env.NODE_ENV = 'production';
    env.MAILJET.API_KEY_PUBLIC = 'public-test-key';
    env.MAILJET.API_KEY_PRIVATE = 'private-test-key';
    env.MAILJET.FROM_EMAIL = 'verified@example.com';
    env.MAILJET.FROM_NAME = 'Shelter Test';

    let request;
    globalThis.fetch = async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        json: async () => ({ Messages: [{ Status: 'success' }] })
      };
    };

    const result = await sendEmail({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Hello <strong>there</strong>.</p>',
      text: 'Hello there.'
    });

    assert.deepEqual(result, { Messages: [{ Status: 'success' }] });
    assert.equal(request.url, 'https://api.mailjet.com/v3.1/send');
    assert.equal(request.options.method, 'POST');
    assert.equal(
      request.options.headers.Authorization,
      `Basic ${Buffer.from('public-test-key:private-test-key').toString('base64')}`
    );
    assert.equal(request.options.signal.aborted, false);
    assert.deepEqual(JSON.parse(request.options.body), {
      Messages: [{
        From: { Email: 'verified@example.com', Name: 'Shelter Test' },
        To: [{ Email: 'recipient@example.com' }],
        Subject: 'Test subject',
        HTMLPart: '<p>Hello <strong>there</strong>.</p>',
        TextPart: 'Hello there.'
      }]
    });

    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({ Messages: [{ Status: 'error', Errors: [{ ErrorMessage: 'Unauthorized' }] }] })
    });
    await assert.rejects(sendEmail({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Hello.</p>'
    }), /Mailjet request failed \(401\): Unauthorized/);

    env.MAILJET.API_KEY_PUBLIC = '';
    await assert.rejects(sendEmail({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Hello.</p>'
    }), /Mailjet API credentials are not configured/);

    env.MAILJET.API_KEY_PUBLIC = 'public-test-key';
    env.MAILJET.FROM_EMAIL = 'Shelter <unverified@example.com>';
    await assert.rejects(sendEmail({
      to: 'recipient@example.com',
      subject: 'Test subject',
      html: '<p>Hello.</p>'
    }), /EMAIL_FROM must be a validated sender email address in Mailjet/);
  } finally {
    globalThis.fetch = originalFetch;
    Object.assign(env.MAILJET, originalMailjet);
    env.NODE_ENV = originalNodeEnv;
  }
});
