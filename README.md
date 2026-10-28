# Sheltered Real Estate Platform - Location Locking & Payment Integration

This document outlines the architecture, configuration, security practices, and testing flows for the user registration, password reset, locked property location, and dual-option paid unlocking features.

> **Current Operational Status**:
> You do **not** need a live payment gateway account (such as Stripe) or a deployed external backend API URL right now. The application comes equipped with a **full-featured, client-side simulation engine** (`src/services/backendApi.ts`) that manages:
> - User registration with strict 18+ age checks and password complexity rules
> - Email verification tokens with rate-limited resend
> - Password reset with single-use, 15-minute expiring tokens
> - Location locking, withholding exact coordinates and addresses
> - Simulated card/PayPal hosted checkout sessions with printable receipts
> - Merchant code transaction ID submission, validation, duplicate detection, and automated or manual admin moderation
> 
> When you are ready to connect your production payment provider and backend server, you can supply `VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY` and `VITE_API_BASE_URL` in `.env` without needing to rewrite any frontend UI components.

---

## 1. Summary of Added and Updated Pages & Routes

All routes support browser Back/Forward navigation, full page refresh, and deep linking via hash routing (`#/route?param=val`):

| Route / Hash | Component | Description |
| :--- | :--- | :--- |
| `#/create-account` | `RegisterPage.tsx` | User registration with full name, email, phone, role, **Date of Birth with 18+ restriction** (enforced in frontend UI and verified by backend), password and confirm password with show/hide toggle, and real-time 6-point complexity checklist. |
| `#/email-verification` | `EmailVerificationPage.tsx` | Verifies user email via URL token (`?token=vtok_...`) or manual 6-digit code. Handles expired, invalid, and already-used tokens. Includes a resend button with an active 60-second rate-limit cooldown. |
| `#/forgot-password` | `ForgotPasswordPage.tsx` | Password reset request. Displays a **neutral response** (*"If this email is registered, a password reset link has been sent"*) regardless of whether the email exists, preventing user enumeration. Provides a local dev preview link with the generated token. |
| `#/reset-password` | `ResetPasswordPage.tsx` | Secure password reset screen accessed via time-limited, single-use token (`?token=rtok_...`). Enforces password strength rules, invalidates the previous password, and clears the token from active validity. |
| `#/property-detail` | `PropertyDetailPage.tsx` | Displays listing information. When location locking is active: withholds exact coordinates, street address, and directions; displays an approximate area badge and blurred map placeholder with a **"Pay to Unlock Location"** CTA button. |
| `#/my-payments` | `MyPaymentsPage.tsx` | Dedicated user billing history displaying all location unlock transactions, payment status badges (Verified, Pending Review, Rejected, Failed), admin rejection reasons, and instant actions ("Check Status", "Retry Gateway Payment", "Submit New Transaction ID"). |
| `#/admin` | `AdminDashboardPage.tsx` | **Admin-only console protected by RBAC**. Contains: (1) Global and per-property location lock toggles, fee amount & currency, payment gateway toggle, merchant code toggle & instructions, transaction ID regex and length rules, and auto vs manual verification mode; (2) Live transactions ledger with status filtering, transaction approval, rejection with mandatory reason, and manual support unlock with mandatory audit trail. |

---

## 2. Environment Variables

Create or update your local `.env` file based on `.env.example`. **Never include secret keys in the frontend codebase.**

```env
# AI Studio Application URL
APP_URL="http://localhost:3000"

# Public Hosted Gateway Client Key (Stripe / Payment Element publishable key only)
VITE_PAYMENT_GATEWAY_PUBLISHABLE_KEY="pk_test_sample_51O..."

# Backend API Base URL
VITE_API_BASE_URL="/api"
```

> **Security Rule**: API secret keys (such as `STRIPE_SECRET_KEY`, database credentials, or merchant private settlement keys) reside exclusively in secure backend server environments and are never bundled into client-side code.

---

## 3. Location Locking & Backend Withholding

- **Disabled by Default**: In compliance with application requirements, location locking is turned **OFF by default** (`enabledGlobally: false`, `lockedPropertyIds: []`).
- **Server-Side Data Withholding**: The frontend does not merely blur the map. When a listing is locked, the backend endpoint `getPropertyLocation(id, userId)` explicitly withholds:
  - Exact latitude and longitude (returns `null`)
  - Precise street address and building number
  - Navigation coordinates and directions link
  - Only approximate neighborhood, district, city, and country are delivered to unauthorized users.
- **Persistent Access**: Once the backend verifies an unlock payment or an admin manually unlocks a listing, the unlocked state persists in user records (`currentUser.unlockedPropertyIds`), automatically showing the full interactive map and directions upon future visits.

---

## 4. Payment Options for Location Unlocking

When clicking **"Pay to Unlock Location"**, users are presented with two verified payment options:

### Option A: Online Payment Gateway (Visa, Mastercard, PayPal)
- **Hosted / Embedded Checkout**: Designed using the secure Stripe Checkout / Payment Element pattern. The frontend never renders raw card number inputs and never handles raw PANs or CVVs.
- **Backend Session Creation**: Initiates a payment session via `POST /payments/location-unlock/gateway-session` sending metadata:
  - `userId`: Registered user ID
  - `propertyId`: Target listing ID
  - `purpose`: `"LOCATION_UNLOCK"`
  - `amount` & `currency`: Configured unlock fee
- **Webhook & Backend Verification**: The application waits for confirmed server-side verification before granting access. Once verified, a printable confirmation receipt is displayed with transaction reference, date, amount, and property details.

### Option B: Merchant Code & Transaction ID Verification
- **Clear Instructions**: Displays the configured merchant code (e.g., `SHELTER-MBL-784`), merchant business name, payment instructions, and supported mobile money / bank channels with a one-click copy button.
- **Transaction ID Validation**:
  - Validates length (e.g., 6–30 characters) and character whitelist (`^[A-Za-z0-9\-_]+$`).
  - Pre-validates against duplicate submissions by the same user.
- **Verification Modes (Configurable by Admin)**:
  - **Automatic Mode**: Immediately validates the transaction against the simulated settlement ledger.
  - **Manual Review Mode**: Flags the transaction as `pending` and displays: *"Your payment is being verified. You will get access once verification is complete."* The admin can review and approve or reject it from the Admin Console.
- **Clear Failure Messages**: If verification fails, specific contextual feedback is displayed:
  - *"Transaction ID not found."*
  - *"Transaction ID already used."*
  - *"Payment amount does not match the unlock fee."*
  - *"Transaction is still pending verification."*
  - *"Verification failed. Please try again or contact support."*

---

## 5. Assumed Backend Endpoints

The frontend client in `src/services/backendApi.ts` implements and communicates with the following REST endpoints:

### Authentication & Security
- `POST /auth/register`: Accepts `{ fullName, email, password, dob, phone?, role? }`. Validates 18+ age requirement and password complexity. Returns registration token and sends verification link.
- `POST /auth/verify-email`: Accepts `{ token, email }`. Activates user account; handles expired/used tokens.
- `POST /auth/resend-verification`: Accepts `{ email }`. Resends verification link with a 60-second rate-limit cooldown.
- `POST /auth/forgot-password`: Accepts `{ email }`. Returns a neutral message to prevent user enumeration.
- `POST /auth/reset-password`: Accepts `{ token, newPassword }`. Invalidator token and updates password.

### Payments & Location Unlocking
- `POST /payments/location-unlock/gateway-session`: Initializes an online payment gateway session with user & property metadata.
- `POST /payments/location-unlock/submit-transaction`: Submits a manual merchant transaction ID for automated or manual verification.
- `GET /payments/location-unlock/status/:id`: Polls/checks transaction verification status.
- `GET /payments/my-payments`: Retrieves the authenticated user's payment and unlock history.

### Admin Management (RBAC Restricted)
- `GET /admin/payment-settings`: Retrieves global and per-property lock configurations and transaction rules.
- `PUT /admin/payment-settings`: Updates location lock and payment configuration (admin only).
- `GET /admin/payments`: Lists all unlock transactions with filters (pending, verified, rejected, duplicate).
- `PUT /admin/payments/:id`: Approves or rejects a submitted transaction (rejection requires a mandatory reason).
- `POST /admin/payments/manual-unlock`: Support unlock granting immediate access to a user with a mandatory audit reason.

---

## 6. How an Admin Configures Location Locking and Payments

1. **Accessing the Admin Console**:
   - Navigate to `#/admin` or click the **"Admin Console"** link in the top bar.
   - For rapid QA and review, toggle the **"Role: Admin / Buyer"** switcher in the top banner. Non-admin users are strictly blocked with an *Administrator Access Required* shield.
2. **Configuring Settings**:
   - **Global Location Locking**: Toggle the master switch to ON to lock all properties worldwide.
   - **Per-Property Overrides**: Select individual properties to selectively lock or unlock specific listings.
   - **Unlock Fee & Currency**: Set fee amount (e.g., $15.00) and currency (`USD`, `EUR`, `GBP`, `UGX`, `KES`, etc.).
   - **Payment Methods**: Toggle Online Gateway and Merchant Code options independently.
   - **Merchant Code Settings**: Update the merchant code, business name, channel instructions, and transaction ID rules (minimum length, maximum length, allowed regex).
   - **Verification Mode**: Choose between **Instant Automated Verification** and **Manual Admin Review**.
3. **Reviewing Transactions**:
   - Switch to the **"Unlock Payments & Verification"** tab.
   - Filter by status (`Pending Review`, `Verified`, `Rejected`).
   - Click **"Approve & Unlock"** to verify a pending merchant payment.
   - Click **"Reject"** to reject a submission, providing a required explanatory reason that is displayed to the user on their *My Payments* screen.
   - Use **"Manual Unlock"** to grant access directly to a user for customer support inquiries.

---

## 7. How to Test the Features Locally

### Test 1: User Registration & 18+ Age Restriction
1. Go to `#/create-account`.
2. Select a Date of Birth less than 18 years ago.
3. Observe real-time error: *"You must be at least 18 years old to create an account."* Submission is blocked.
4. Select a Date of Birth greater than 18 years ago. Notice the age counter badge displays valid age.
5. Enter a password that does not meet the 6 complexity rules. Review the real-time requirements checklist.
6. Complete registration. You will be redirected to the email verification screen with your verification token.

### Test 2: Password Reset Flow
1. Go to `#/sign-in` and click **"Forgot password?"** (or navigate to `#/forgot-password`).
2. Enter any email address (e.g., `user@example.com`).
3. Submit and observe the neutral message: *"If this email is registered, a password reset link has been sent."*
4. Click the preview reset link (`#/reset-password?token=...`).
5. Enter a strong new password and confirm. On success, the token is invalidated, the old password no longer works, and you are redirected to sign in.

### Test 3: Locked Property Location & Option A (Gateway Payment)
1. In the top bar, click the **Role: Buyer** badge to switch to **Role: Admin**.
2. Click **Admin Console** (`#/admin`) and turn **Global Location Locking** to **ON**.
3. Switch role back to **Buyer** and open any property listing (e.g., clicking on a featured home from the homepage or search).
4. Notice that the exact street address is withheld (*"Exact Address Locked"* badge is shown) and the map displays a blurred lock overlay with the prompt: *"Exact location is locked. Pay to unlock."*
5. Click **"Pay to Unlock Location ($15)"**.
6. In the modal, select **Option A: Online Payment Gateway**.
7. Select Visa, Mastercard, or PayPal, click **"Proceed to Secure Checkout"**, and confirm payment.
8. The payment confirmation receipt is displayed, and the property location is permanently unlocked, revealing the exact coordinates, pin, and directions.

### Test 4: Option B (Merchant Code & Admin Review)
1. Switch to **Role: Admin** and set Merchant Verification Mode to **Manual Admin Review**.
2. Switch back to **Role: Buyer** and open a locked property.
3. Click **"Pay to Unlock Location"** and select **Option B: Merchant Code**.
4. Copy the merchant code, enter a transaction ID (e.g., `TXN-884920`), and click **"Submit Transaction ID for Verification"**.
5. Observe the pending status message: *"Your payment is being verified. You will get access once verification is complete."*
6. Visit `#/my-payments` to see your pending transaction.
7. Switch to **Role: Admin**, navigate to `#/admin`, find the pending transaction in the ledger, and click **Approve & Unlock**.
8. Refresh or return to the property as the buyer: the location is now fully unlocked!
