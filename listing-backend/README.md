# Sheltered Real Estate Listing Platform - Backend API (`listing-backend`)

This is the standalone, production-ready Node.js & Express RESTful API backend for the **Sheltered Real Estate** web application, featuring Prisma ORM (PostgreSQL), JWT authentication, strict 18+ age verification, Stripe payments, Cloudflare R2 / S3 media storage, and admin-governed location locking with backend withholding.

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

### 4. Dual Payment Options
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

---

## 4. API Endpoints Reference

All endpoints are prefixed with `/api/v1`:

### Authentication (`/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register user (requires DOB >= 18) | Public |
| `POST` | `/auth/login` | Login and obtain JWT tokens | Public |
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
| `PUT` | `/properties/:id` | Update property listing | Owner / Admin |
| `DELETE` | `/properties/:id` | Delete property listing | Owner / Admin |

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
