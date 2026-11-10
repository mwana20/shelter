# Sheltered Real Estate Listing Platform - Backend API (`listing-backend`)

This is the standalone Node.js & Express RESTful API backend for the **Sheltered Real Estate** web application, featuring Prisma ORM (PostgreSQL), database-validated JWT sessions, strict 18+ age verification, Stripe payments, Cloudflare R2 / S3 media storage, and admin-governed location locking with backend withholding.

---

## 1. Directory Structure

```
listing-backend/
├── src/
│   ├── config/
│   │   ├── env.js               # Environment variables parser
│   │   ├── database.js          # Prisma client singleton
│   │   ├── r2.js                # Cloudflare R2 / S3 client
│   │   ├── stripe.js            # Stripe SDK client
│   │   ├── cors.js              # CORS configuration
│   │   └── logger.js            # Winston logger
│   │
│   ├── modules/
│   │   ├── auth/                # Auth (Register, Login, Email Verification, Password Reset)
│   │   ├── users/               # User profiles and user management
│   │   ├── properties/          # Listing catalog with location withholding
│   │   ├── media/               # Media presigned URLs & asset management
│   │   ├── payments/            # Gateway (Stripe) & Merchant code payment flows
│   │   ├── unlocks/             # Confidential unlocked location access
│   │   ├── admin/               # Governance, locking settings & verification reviews
│   │   └── notifications/       # Email & alert notifications
│   │
│   ├── middlewares/             # Auth, RBAC, Validation, Rate Limiting, Error handling
│   ├── utils/                   # ApiError, ApiResponse, Age verification, Password hashing
│   ├── jobs/                    # Queues and background workers
│   ├── validators/              # Zod validation schemas
│   ├── app.js                   # Express application setup
│   └── server.js                # Server entry point & graceful shutdown
│
├── prisma/
│   ├── schema.prisma            # PostgreSQL relational schema
│   └── seed.js                  # Database seeder (Admin, properties, default settings)
│
├── tests/                       # Unit & integration tests
│   ├── auth.test.js
│   ├── property.test.js
│   ├── payment.test.js
│   ├── unlock.test.js
│   └── admin.test.js
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── Dockerfile
```

---

## 2. Core Security & Architectural Principles

### 1. 18+ Age Restriction
- Both frontend and backend verify the user's age based on `dateOfBirth`.
- The backend performs the final authoritative verification in `src/utils/age.js` and `src/validators/auth.schema.js`.
- Any user under 18 is blocked from registering with the exact error:
  `"You must be at least 18 years old to create an account."`

### 2. Confidential Location Withholding
- **Disabled by default**: Location locking is turned OFF by default in `LocationLockSetting`.
- **Server-Side Data Withholding**: When location locking is enabled globally or overridden for a listing, the backend explicitly withholds:
  - `latitude` (returns `null`)
  - `longitude` (returns `null`)
  - `exactAddress` (returns `null`)
  - `directionsGuide` (returns `null`)
  - `cadastralPlotNumber` (returns `null`)
- Only approximate public data (`district`, `region`, `country`) is returned to unauthorized visitors.
- Exact location details are only returned if the user is an **ADMIN**, the **property owner**, or has a verified **`LocationUnlock`** record from an approved payment.

### 3. Password Reset & Anti-Enumeration
- Requesting a password reset (`POST /api/v1/auth/forgot-password`) always returns a neutral response:
  `"If this email is registered, a password reset link has been sent."`
  This prevents malicious actors from harvesting registered user emails.
- Reset tokens are time-limited (15 minutes), single-use, and automatically invalidated once used.

### 4. Authentication Sessions
- Access tokens are short-lived and validated against an active `AuthSession` record on protected requests.
- Refresh tokens are rotated and stored only as hashes in the database; the raw refresh token is sent in an HttpOnly cookie.
- The refresh cookie is a browser-session cookie. It is `Secure` in production and uses `AUTH_COOKIE_SAME_SITE` (defaults to `none` in production for cross-site frontend/API hosting and `lax` in development).
- CORS allows the production Vercel frontend at `https://shelter-coral.vercel.app` and any additional exact origins configured through `CORS_ORIGIN` on the API host. Do not include URL paths.
- `POST /api/v1/auth/logout` invalidates the server-side session and clears the refresh cookie.

### 5. Dual Payment Options
- **Option A (Stripe Payment Gateway)**: Generates secure Checkout Sessions with metadata (`userId`, `propertyId`, `purpose: LOCATION_UNLOCK`, `amount`, `currency`). Verifies payments via webhook or session handshake before granting location access.
- **Option B (Merchant Code & Transaction ID)**: Accepts transaction references (e.g., `TXN-884920`), enforces admin-defined length and regex character rules, prevents duplicate submissions, and supports both automated verification and manual admin moderation.

---

## 3. Setup & Getting Started

### Prerequisites
- Node.js >= 20.0.0
- PostgreSQL database instance
- (Optional) Stripe account for live card checkout
- (Optional) Cloudflare R2 / AWS S3 bucket for media assets

### Installation
```bash
cd listing-backend
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL database URL and JWT secrets. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) before seeding; never commit `.env`.

### Cloudflare R2 Property Media

Configure these values in the Render backend environment. Keep all access keys private; do not add them to the Vite frontend environment or commit them to Git:

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `R2_ACCOUNT_ID` | Cloudflare account ID used by the S3-compatible endpoint | Required |
| `R2_ACCESS_KEY_ID` | Private R2 API token access key | Required |
| `R2_SECRET_ACCESS_KEY` | Private R2 API token secret | Required |
| `R2_BUCKET_NAME` | Bucket for property media | `sheltered-property-media` |
| `R2_PUBLIC_URL` | HTTPS custom domain serving public media, without a trailing slash | Required |
| `R2_MAX_IMAGE_SIZE_BYTES` | Maximum source and optimized image size | `12582912` (12 MiB) |
| `R2_MAX_VIDEO_SIZE_BYTES` | Maximum MP4 size | `104857600` (100 MiB) |
| `R2_MAX_THUMBNAIL_SIZE_BYTES` | Maximum generated thumbnail size | `1048576` (1 MiB) |
| `R2_UPLOAD_URL_TTL_SECONDS` | Presigned PUT lifetime (capped at 15 minutes) | `900` |
| `R2_UPLOAD_BATCH_TTL_MINUTES` | Staging batch cleanup lifetime | `1440` |

Create a Cloudflare R2 custom domain for public delivery and set it as `R2_PUBLIC_URL`. The API stores only generated object keys, URLs, MIME types, byte sizes, ordering, and optional thumbnail references. File bytes upload directly from the browser to R2.

Configure the R2 bucket CORS policy for the real frontend origins (do not use `*`):

```json
[
  {
    "AllowedOrigins": [
      "https://shelter-coral.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

R2 bucket CORS is separate from the Express API `CORS_ORIGIN` setting. Update both lists when the frontend domain changes. `POST /api/v1/media/presigned-url` is authenticated and restricted to approved owners/sellers and brokers/agents; it accepts exactly four images and one MP4 video. The returned short-lived PUT URLs are bound to server-generated keys, declared content types, and expected content lengths. After direct uploads, `POST /api/v1/properties` validates and associates the references. Image cards use generated thumbnails; detail views use the larger optimized WebP images.

### Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations
npm run prisma:migrate

# Create/update only the administrator from ADMIN_EMAIL / ADMIN_PASSWORD
npm run admin:create

# Optional: seed default settings and a sample listing
npm run prisma:seed
```

The seed command does not create a default admin password. The administrator signs in through the normal sign-in page and receives admin access only because the database role is `ADMIN`.
`npm install` runs `prisma generate` automatically through the `postinstall` script. The production `npm start` command runs `prisma migrate deploy` before starting the API, so the generated client and additive schema migrations are both applied when the service deploys. The Prisma CLI is a production dependency for these deployment steps. Do not use `prisma migrate dev` against production.

### Proxy Trust
The Express app trusts one proxy hop for client IP resolution. This matches the Render deployment topology and allows `express-rate-limit` to key limits by the originating client IP. Do not change this to `true` or trust forwarded headers from arbitrary sources; if the hosting proxy topology changes, adjust the hop count to match it.

### Start Server
```bash
# Development mode with auto-reload:
npm run dev

# Production mode:
npm start
```

### Running Tests
```bash
npm test
```

### Subscription onboarding and schema

The subscription and property-review migrations are additive. Apply them to a development database with `npx prisma migrate deploy`; production startup applies pending migrations through the existing `npm start` deployment command. Do not use `prisma migrate dev` against production.

The subscription migration creates a Free plan configuration (30-day default validity, one active listing, one map unlock) and progressive discount tiers. Paid pricing is intentionally initialized to zero. An administrator must set a positive monthly price and review the discount ranges in **Admin → Subscriptions** before paid checkout can be offered.

Paid subscriptions use one-time Stripe Checkout sessions and activate only from a verified Stripe webhook. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_URL` on the backend; `APP_URL` must be the public frontend origin. Register `/api/v1/payments/webhook/stripe` with Stripe for checkout completion, expiration, and asynchronous payment failure events. Subscription checkout does not create recurring charges.

### Subscriptions (`/subscriptions`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/subscriptions/plans` | View Free and Paid plan configuration | Public |
| `GET` | `/subscriptions/quote?months=1` | Calculate backend-validated pricing (1–48 months) | Public |
| `GET` | `/subscriptions/me` | View current plan, expiry, usage, payment history | Authenticated |
| `POST` | `/subscriptions/select` | Activate Free or create/reuse one pending Paid checkout | Verified owner / broker |
| `POST` | `/subscriptions/map-unlocks` | Use an available subscription map unlock | Authenticated |

---

## 4. API Endpoints Reference

All endpoints are prefixed with `/api/v1`:

### Authentication (`/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register user (requires DOB >= 18) | Public |
| `POST` | `/auth/login` | Login, receive an access token, and set the HttpOnly refresh cookie | Public |
| `POST` | `/auth/refresh` | Rotate the refresh cookie and issue a new access token | Refresh cookie |
| `POST` | `/auth/logout` | Invalidate the current session and clear the refresh cookie | Refresh cookie |
| `POST` | `/auth/verify-email` | Verify email with token or 6-digit code | Public |
| `POST` | `/auth/resend-verification` | Resend verification email (60s cooldown) | Public |
| `POST` | `/auth/forgot-password` | Request password reset link (neutral response) | Public |
| `POST` | `/auth/reset-password` | Reset password using time-limited token | Public |
| `GET` | `/auth/me` | Get authenticated user profile | Authenticated |

### Properties (`/properties`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/properties` | List properties (with location withholding) | Public |
| `GET` | `/properties/id/:id` | Get property by ID (with location withholding) | Public |
| `GET` | `/properties/:slug` | Get property by slug (with location withholding) | Public |
| `POST` | `/properties` | Submit new property listing | Authenticated |
| `GET` | `/properties/mine` | View own submissions, media, status, and review history | Authenticated |
| `PUT` | `/properties/:id` | Update property listing | Owner / Admin |
| `DELETE` | `/properties/:id` | Delete property listing | Owner / Admin |

### Property Media (`/media`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/media/limits` | Get upload types and size limits | Public |
| `POST` | `/media/presigned-url` | Create a five-file upload batch and presigned URLs | Seller / Agent |
| `POST` | `/media/presigned-url/:batchId/refresh` | Renew URLs for failed files in the caller's batch | Seller / Agent |
| `DELETE` | `/media/:id` | Remove non-required media owned by the caller | Owner / Agent / Admin |

### Payments & Unlocks (`/payments` & `/unlocks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/location-unlock/gateway-session` | Create Stripe checkout session | Authenticated |
| `POST` | `/payments/location-unlock/verify-gateway` | Verify gateway checkout completion | Authenticated |
| `POST` | `/payments/location-unlock/submit-transaction` | Submit merchant transaction ID | Authenticated |
| `GET` | `/payments/location-unlock/status/:id` | Check transaction verification status | Authenticated |
| `GET` | `/payments/my-payments` | User unlock payment history | Authenticated |
| `POST` | `/payments/webhook/stripe` | Stripe webhook listener | Webhook |
| `GET` | `/unlocks/:propertyId` | Reveal exact coordinates & address | Verified Only |
| `GET` | `/unlocks/my-unlocked` | List user's unlocked listings | Authenticated |

### Admin Console (`/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/payment-settings` | Get location lock & payment configuration | Admin |
| `PUT` | `/admin/payment-settings` | Update locking policies & payment rules | Admin |
| `POST` | `/admin/property-lock-override` | Override locking for a specific listing | Admin |
| `GET` | `/admin/payments` | Ledger of all transactions & submissions | Admin |
| `PUT` | `/admin/payments/:id` | Approve or Reject payment (with reason) | Admin |
| `POST` | `/admin/payments/manual-unlock` | Support unlock with audit log | Admin |
| `GET` | `/admin/properties` | Property approval queue and review history | Admin |
| `PUT` | `/admin/properties/:id/approve` | Approve a submitted property | Admin |
| `PUT` | `/admin/properties/:id/reject` | Reject a property with a review note | Admin |
| `PUT` | `/admin/properties/:id/request-corrections` | Request owner corrections | Admin |
| `GET` | `/admin/subscriptions/config` | Read pricing, discount, expiry, and limit configuration | Admin |
| `PUT` | `/admin/subscriptions/config` | Update subscription settings | Admin |
| `GET` | `/admin/subscriptions` | View subscription payment ledger | Admin |
| `GET` | `/admin/subscriptions/users` | List users and subscription status | Admin |
| `POST` | `/admin/subscriptions/users/:id/grant` | Manually grant a subscription with an audit record | Admin |
| `PUT` | `/admin/subscriptions/:id/revoke` | Revoke a subscription with an audit record | Admin |
