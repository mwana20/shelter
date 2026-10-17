<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f4cc8bb0-598b-46f7-ac48-ac89866b3ab6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Marketplace Preview Status

This repository currently contains a browser-only React/Vite preview. Listings, saved homes, inquiries, and some dashboard state use mock data or browser local storage. There is no production database, authorization service, media storage, transactional email/SMS provider, or payment gateway configured. Do not use the preview to collect real identity documents, credentials, or payments.

Seeded property and agent records are sample data, not verified offers. Approval actions in the preview do not publish listings to a live service.

## Public Configuration

Copy `.env.example` to `.env.local` and set only public company details and service URLs. Values prefixed with `VITE_` are bundled into browser code and must never contain passwords, API secrets, payment credentials, or private keys. Leave contact, authentication, and form endpoints blank until their corresponding server services are implemented and tested. The default language is limited to locales marked available in `src/i18n/languages.ts`.

Public contact details are shown on the Contact page and in the site footer. The email defaults to `info@sheltered.com`; set `VITE_COMPANY_EMAIL` to override it. Configure `VITE_COMPANY_PHONES` and/or `VITE_COMPANY_WHATSAPP` with the public phone number in international format (digits and an optional `+`); when no WhatsApp number is set, the first phone number is used for direct WhatsApp messages. Add the official profile URLs with `VITE_COMPANY_TWITTER`, `VITE_COMPANY_INSTAGRAM`, `VITE_COMPANY_LINKEDIN`, and `VITE_COMPANY_FACEBOOK`. Social links are hidden until configured.

The language catalog lists the requested languages, but English is the only enabled locale. The English policy pages are drafts and require qualified legal review before production use.

## Service Endpoint Contracts

The client does not implement these services; blank endpoints intentionally keep the related actions unavailable.

- `VITE_AUTH_API_URL`: same-site secure API base. The UI calls `POST /api/auth/register` and `POST /api/auth/login` with credentials included. Registration receives name, email, phone, requested non-admin role, password, and policy acceptance metadata. Login must return a verified account and secure session cookie; authorization and email verification must be enforced server-side.
- `VITE_MEDIA_UPLOAD_ENDPOINT`: authenticated multipart `POST` with exactly five `photos` fields and one `video` field. The service must inspect file content, enforce limits, store media durably, and return `{ "images": ["... five URLs ..."], "videoUrl": "..." }`.
- `VITE_LISTING_SUBMISSION_ENDPOINT`: authenticated `POST` with listing fields and uploaded media URLs. The server must derive the owner from the session, ignore client-supplied role/status/verification claims, validate all data, and create a pending listing.
- `VITE_CONTACT_FORM_ENDPOINT`: `POST` JSON contact fields and return a success status only after accepting the message.

Use same-site HTTPS, secure cookies, CSRF defenses, rate limits, server-side authorization, and private storage as appropriate. The current project does not provide or validate any of these backends.
