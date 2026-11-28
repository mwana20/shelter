# Sheltered Web App — Architecture and Developer Guide

This guide describes the current implementation of the Sheltered real-estate marketplace: its frontend, API, data model, integrations, and local development workflow. The focused feature walkthrough in [README.md](./README.md) and the API deployment notes in [listing-backend/README.md](./listing-backend/README.md) provide additional detail.

## 1. Product and system overview

Sheltered is a React single-page application for finding, listing, and managing property. Its separate Express API provides persistent accounts, property listings, media metadata, subscriptions, payments, and administrative workflows.

```text
Browser
  ├─ React + TypeScript SPA (Vite build; hash-based routes)
  ├─ JSON requests → /api/v1
  │    └─ Vite proxy in development / Vercel rewrite in deployment
  │         └─ Express API (listing-backend)
  │              ├─ PostgreSQL through Prisma
  │              ├─ Stripe checkout and webhook integration
  │              ├─ S3-compatible Cloudflare R2 media storage
  │              └─ Email provider integration
  └─ Direct PUT media uploads → presigned R2 URLs
```

The browser is not the authority for access control, payment verification, property moderation, or confidential property coordinates. Those decisions belong to the API. The frontend also contains demo fixtures and some simulated/local workflows; see [Frontend data and service boundaries](#5-frontend-data-and-service-boundaries).

## 2. Repository map

```text
.
├── index.html                 # HTML shell, metadata, fonts, Leaflet stylesheet
├── package.json               # Frontend scripts and dependencies
├── vite.config.ts             # React/Tailwind plugins and development API proxy
├── vercel.json                # Static build, API proxy rewrite, SPA fallback
├── src/                       # React and TypeScript application
│   ├── App.tsx                # App shell, page selection, global modals
│   ├── main.tsx               # React DOM entry point
│   ├── index.css              # Global styles and Tailwind entry
│   ├── types.ts               # Shared frontend domain types
│   ├── context/               # Shared app state and actions
│   ├── pages/                 # Page-level views
│   ├── components/            # Reusable UI, dashboards, maps, modals
│   ├── services/              # API clients and local/demo service helpers
│   ├── data/                  # Demo properties, agents, areas, locations
│   ├── config/                # Frontend company configuration
│   ├── i18n/                  # Languages, translations, localized descriptions
│   ├── utils/                 # Navigation, currency, formatting, analytics
│   └── assets/                # Images, icons, and media references
└── listing-backend/           # Independently run Node.js REST API
    ├── src/
    │   ├── app.js, server.js  # Express middleware/routes and server lifecycle
    │   ├── config/            # Environment, Prisma, CORS, Stripe, R2, logging
    │   ├── middlewares/       # Authentication, authorization, validation, errors
    │   ├── modules/           # Feature modules (routes/controllers/services)
    │   ├── jobs/              # Email/media queues and workers
    │   ├── utils/             # Shared API, auth, pagination, and domain helpers
    │   └── validators/        # Shared Zod schemas
    ├── prisma/
    │   ├── schema.prisma      # PostgreSQL models and enums
    │   ├── migrations/        # Versioned database changes
    │   ├── seed.js            # Optional baseline data
    │   └── create-admin.js    # Admin account setup
    └── tests/                 # Node test-runner API tests
```

## 3. Frontend structure

### Entry point and navigation

`src/main.tsx` mounts `App`. `App.tsx` wraps the application in `AppProvider`, renders the shared navigation/footer, selects a page, and mounts application-wide modals and floating actions.

Navigation is managed by `src/utils/navigation.ts` and `AppContext.tsx`, rather than a route-library router. The current page and relevant identifiers are stored in the URL hash, so deep links and browser Back/Forward are supported. Examples:

| Hash | View |
|---|---|
| `#/` | Home |
| `#/search`, `#/buy`, `#/rent`, `#/commercial`, `#/land` | Property discovery |
| `#/property-detail?id=<id>` | Property detail |
| `#/list-property` | Listing submission |
| `#/seller-dashboard`, `#/my-sheltered` | Seller or buyer portal, based on the signed-in role |
| `#/saved`, `#/my-payments`, `#/subscription` | Saved listings, payment history, membership |
| `#/sign-in`, `#/create-account`, `#/forgot-password`, `#/reset-password`, `#/email-verification` | Account flows |
| `#/admin` | Admin portal |
| `#/areas`, `#/agents`, `#/about`, `#/contact`, `#/terms`, `#/privacy` | Discovery and information pages |

`normalizePage` handles legacy aliases such as `#/explore`, `#/plans`, and `#/payments`. `App.tsx` applies signed-in checks and role-specific rendering for portal and admin pages; the API independently enforces authorization.

### Pages

| Area | Page components |
|---|---|
| Discovery | `HomePage`, `SearchPage`, `PropertyDetailPage`, `AreasPage`, `AgentsPage` |
| Listing and account portals | `ListPropertyPage`, `SellerDashboardPage`, `MyShelteredPage`, `SavedHomesPage`, `ProfileSettings` |
| Authentication | `SignInPage`, `RegisterPage`, `EmailVerificationPage`, `ForgotPasswordPage`, `ResetPasswordPage` |
| Payments and administration | `SubscriptionPage`, `MyPaymentsPage`, `AdminDashboardPage` |
| Information | `AboutPage`, `ContactPage`, `TermsOfServicePage`, `PrivacyPolicyPage`, `ServicePolicyPage` |

### Shared components

- **Navigation and layout:** `Navbar`, `Footer`, `DashboardSidebar`, `FloatingActions`.
- **Property interaction:** `PropertyCard`, `InteractiveMap`, `PropertyLocationPicker`, `ImageGalleryModal`, `ComparisonModal`.
- **Contact and safety:** `ContactAgentModal`, `ScheduleViewingModal`, `ReportListingModal`.
- **Accounts and payments:** `AuthModal`, `OtpVerificationModal`, `PaymentCheckoutModal`, `LocationUnlockModal`.
- **Listing media and account settings:** `PropertyMediaUploader`, `ProfileSettings`.
- **Dashboard visualization:** `CumulativeBarChart`.

### Shared application state

`src/context/AppContext.tsx` exposes the app's cross-page state through `useApp()`. This includes the active route and selected property, property data and filters, current user and auth readiness, language/currency preferences, location-lock and payment UI state, saved/compared listings, contact/viewing requests, audit/email presentation data, modal state, and notifications. Page-specific form state remains in its page or component.

## 4. Backend structure and request lifecycle

The API is an ES-module Express application. `src/app.js` configures HTTP security headers, CORS, request logging, rate limits, Stripe's raw-body webhook route, JSON/form parsing, health/root routes, feature routers, 404 handling, and centralized errors. `src/server.js` starts the listener, runs periodic media cleanup and subscription-expiry jobs, and disconnects Prisma on shutdown.

Most feature modules follow the same layering:

```text
*.routes.js → validation/auth middleware → *.controller.js → *.service.js
                                                 └──────→ Prisma / integration
```

`properties` also has a repository and domain utilities. Shared validation is implemented with Zod; response/error wrappers and helpers live under `utils/`. Admin routes apply authentication and the admin role check to the entire router.

### Backend feature modules

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, email verification, password recovery, token refresh, logout |
| `users` | Profile updates and admin-only user listing/details |
| `properties` | Public catalog, owner listings, listing mutations, and location-aware responses |
| `media` | Upload limits, presigned upload batches, refresh, and media deletion |
| `payments` | Stripe checkout/webhook verification and merchant-code transaction submissions |
| `unlocks` | Authorized exact-location reads and a user's unlocked listing history |
| `subscriptions` | Plan catalog/quotes, membership selection, and subscription map unlocks |
| `admin` | Payment settings/review, manual unlocks, owner/property review, and subscription management |
| `notifications` | In-app notifications and email-related services |

## 5. Frontend data and service boundaries

Services under `src/services/` isolate network and local functionality:

| Service | Role |
|---|---|
| `authApi.ts` | API-backed login, registration, profile, email verification, password reset, refresh, and logout |
| `propertyApi.ts` | Fetches public/owner listings and submits or updates a listing through the API |
| `mediaApi.ts` | Requests upload limits and presigned URLs, then sends file bytes directly to R2 |
| `subscriptionApi.ts` | Calls the subscription API for plan catalog, quotes, selection, and map unlocks |
| `subscriptionAdminApi.ts` | Admin subscription configuration and management requests |
| `backendApi.ts` | Lock/payment compatibility layer; includes simulated/local workflows as well as admin API requests |
| `authSecurity.ts` | Browser-side email/audit presentation storage and OTP helper functions |
| `mockAuthService.ts` | Mock auth adapter and demo user |

`src/data/` contains mock property, agent, area, and location data used by the UI. Do not treat demo records, browser storage, or simulated payment responses as production records or proof of a real payment. The authoritative account, listing, subscription, payment, and unlock records are in the backend database where the corresponding API workflow is used.

`src/types.ts` contains the frontend domain contracts. `src/utils/currency.ts` supplies a fixed demonstration exchange-rate table; it is not a live FX service or suitable for settlement calculations.

## 6. API reference

All API paths are prefixed with `/api/v1`. The list below is based on the Express route declarations; validation and role restrictions are applied at those routes or at router level.

| Area | Methods and paths | Access |
|---|---|---|
| Health | `GET /health`, `GET /` | Public |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/verify-password-reset-code`, `/auth/reset-password`; `GET /auth/me` | Public/session as appropriate; `/me` authenticated |
| Users | `GET /users/profile`, `PATCH /users/profile` | Authenticated |
| Users | `GET /users`, `GET /users/:id` | Admin |
| Properties | `GET /properties`, `/properties/id/:id`, `/properties/:slug` | Public; optional authentication |
| Properties | `GET /properties/mine`, `POST /properties`, `PUT /properties/:id`, `DELETE /properties/:id` | Authenticated; creation limited to seller/agent; mutations are ownership/role controlled |
| Media | `GET /media/limits` | Public |
| Media | `POST /media/presigned-url`, `POST /media/presigned-url/:batchId/refresh`, `DELETE /media/:id` | Seller/agent; delete also permits admin |
| Payments | `POST /payments/webhook/stripe` | Stripe webhook |
| Payments | `POST /payments/location-unlock/gateway-session`, `/payments/location-unlock/verify-gateway`, `/payments/location-unlock/submit-transaction`; `GET /payments/location-unlock/status/:id`, `/payments/my-payments` | Authenticated |
| Unlocks | `GET /unlocks/my-unlocked`, `GET /unlocks/:propertyId` | Authenticated |
| Subscriptions | `GET /subscriptions/plans`, `/subscriptions/quote` | Public |
| Subscriptions | `GET /subscriptions/me`, `POST /subscriptions/select`, `/subscriptions/map-unlocks` | Authenticated |
| Notifications | `GET /notifications`, `/notifications/unread-count`; `PUT /notifications/:id/read`, `/notifications/read-all` | Authenticated |
| Admin settings/payments | `GET`, `PUT /admin/payment-settings`; `POST /admin/property-lock-override`; `GET /admin/payments`; `PUT /admin/payments/:id`; `POST /admin/payments/manual-unlock` | Admin |
| Admin owners | `GET /admin/owners`; `PUT /admin/owners/:id/approve`, `/admin/owners/:id/reject` | Admin |
| Admin properties | `GET /admin/properties`, `/admin/properties/statistics`; `PUT /admin/properties/:id/approve`, `/admin/properties/:id/reject`, `/admin/properties/:id/request-corrections` | Admin |
| Admin subscriptions | `GET`, `PUT /admin/subscriptions/config`; `GET /admin/subscriptions`, `/admin/subscriptions/users`; `POST /admin/subscriptions/users/:id/grant`; `PUT /admin/subscriptions/:id/revoke` | Admin |

## 7. Data model

The Prisma schema in `listing-backend/prisma/schema.prisma` defines PostgreSQL persistence. Its principal entities are:

| Model group | Models | Purpose |
|---|---|---|
| Identity and sessions | `User`, `AuthSession`, `VerificationToken`, `PasswordResetToken` | User profiles/roles, active sessions, email verification, and password recovery |
| Listings | `Property`, `PropertyReview`, `PropertyLockOverride`, `Media`, `MediaUploadBatch` | Property details/status, moderation history, location policy overrides, media metadata, staged uploads |
| Payments and access | `LocationLockSetting`, `Payment`, `LocationUnlock` | Global location/payment policy, payment attempts/reviews, durable unlock grants |
| Memberships | `SubscriptionConfig`, `SubscriptionDiscount`, `Subscription`, `SubscriptionPayment`, `SubscriptionMapUnlock` | Pricing/limits, subscriptions, membership payments, map unlock usage |
| Operations | `AuditLog`, `Notification` | Administrative/security audit records and user notifications |

Enums encode user roles and account status, property moderation status, media kind, payment method/status, verification mode, and subscription plan/status. Relational uniqueness and indexes (for example one unlock per user/property and one map unlock per subscription/property) are defined in the schema.

## 8. Important application flows

### Account and session lifecycle

The API validates registration data, including the 18+ rule. Authentication issues a short-lived access token and maintains a server-side session with a rotated refresh token delivered through an HttpOnly cookie. The frontend restores sessions during app initialization and periodically attempts refresh while authenticated. Email verification and password reset use expiring, single-use credentials; forgot-password responses are designed to avoid revealing whether an email is registered.

### Listing submission and media

Seller/agent clients request a media upload batch. The API returns short-lived presigned R2 upload URLs; the browser uploads files directly to R2. The listing submission then references the batch and generated storage keys. The backend persists the listing/media metadata and applies moderation rules. Upload cleanup and subscription expiry are periodically run by the API process.

### Location privacy and unlocking

When location locking applies, the API must withhold exact address, coordinates, directions, and cadastral details from users who are not permitted to see them. Access is determined server-side (including approved unlocks and privileged/owner access), not by the frontend's map blur alone. Unlocks can be associated with verified gateway payments, merchant-code review, subscription entitlements, or admin action, according to the relevant configured workflow.

### Property and account moderation

Admin-only endpoints manage owner approval, listing review (approve/reject/request corrections), location-lock/payment configuration, and subscription administration. These actions are protected by backend authentication and role checks; hiding an admin page in the SPA is not an authorization boundary.

## 9. Local development and verification

### Frontend

Requirements: a current Node.js runtime compatible with Vite 8 and the package manifest, plus Bun if you choose to use the checked-in `bun.lock`.

```powershell
npm install
npm run dev
```

Vite serves the frontend on port `3000` and proxies `/api/v1` to `http://localhost:5000` by default. To use another API origin for development, configure `VITE_DEV_API_PROXY_TARGET`. Set `VITE_API_BASE_URL=/api/v1` for the expected same-origin API path. Restart Vite after changing environment values.

Available checks:

```powershell
npm run lint
npm run build
```

### Backend

Requirements: Node.js 20 or newer and a PostgreSQL database. Optional integrations include Stripe, an S3-compatible R2 bucket, and the configured email provider.

```powershell
cd listing-backend
npm install
# Create .env using .env.example as a variable-name/template reference.
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Set required database and unique JWT secrets in the backend environment before starting the API. Add integration credentials only when enabling those services. Never place server secrets in the frontend `VITE_*` environment or commit real credentials. Create an administrator with `npm run admin:create`; optional seed data can be loaded with `npm run prisma:seed`.

Backend checks:

```powershell
npm test
npm run lint
```

The root `npm run lint` is a TypeScript check (`tsc --noEmit`), not an ESLint invocation. The backend's `npm start` runs pending production migrations before starting the service; use the development migration workflow only against development databases.

## 10. Deployment and configuration boundaries

- **Frontend:** `npm run build` emits `dist/`. `vercel.json` configures Vite output, rewrites `/api/v1/*` to the configured API proxy destination, and falls back to `index.html` for SPA navigation.
- **Development proxy:** `vite.config.ts` targets the local API by default and supports `VITE_DEV_API_PROXY_TARGET`.
- **Backend:** deploy `listing-backend` as a separate Node service with its own PostgreSQL connection, secrets, CORS allowlist, and integration credentials.
- **Media:** configure R2 credentials and a public media URL on the backend, plus matching bucket CORS origins. Browsers receive only scoped presigned upload URLs.
- **Payments/email:** secret Stripe and email-provider credentials belong only in the backend environment. Stripe webhook requests require the raw body and are mounted before JSON parsing.
- **Configuration source:** use `listing-backend/.env.example` as the backend variable reference and `listing-backend/README.md` for detailed provider setup, deployment, and rate-limit notes. Frontend variables are embedded at build time and must not contain private credentials.

## 11. Localization and presentation

`src/i18n/` configures translations and localized property descriptions. The language selector data is in `languages.ts`; Arabic is configured as right-to-left. `src/utils/currency.ts` contains supported display currencies and demonstration conversion rates. `src/config/company.ts` holds the frontend company profile; sample content and media are under `src/data/` and `src/assets/`.

## 12. Tests and maintenance notes

The backend tests under `listing-backend/tests/` cover authentication, users, email, properties, media, payments, unlocks, subscriptions, admin behavior, and admin statistics. Run them with `npm test` from `listing-backend/`. The frontend currently exposes TypeScript checking and a production build rather than a dedicated frontend test script.

When changing a feature, keep its surfaces aligned: page/component behavior, shared types/context, frontend service contract, backend route/validation/service behavior, Prisma migrations, and relevant tests/documentation. In particular:

- Never rely on client-side checks to enforce permissions or location privacy.
- Do not use demo fixture data, browser-stored simulations, or fixed currency rates for production decisions.
- Make schema changes through Prisma migrations and keep generated Prisma Client in sync.
- Keep media uploads direct to presigned storage URLs; do not proxy large file bodies through Express.
