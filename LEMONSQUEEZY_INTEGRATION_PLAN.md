# LemonSqueezy Payment Integration Plan

## Overview

This document outlines the complete implementation plan for integrating LemonSqueezy as the payment gateway for Notto, including a **$28 lifetime deal limited to the first 50 users**.

- **Payment Provider**: LemonSqueezy
- **Checkout Type**: Hosted checkout (LemonSqueezy handles the UI)
- **User Limit**: 50 users (enforced via LemonSqueezy stock count)
- **Refund Policy**: 14-day money-back guarantee
- **Tech Stack**: Hono API on Vercel + PostgreSQL (Neon) + Drizzle ORM

---

## Phase 1: Database Schema Updates

### New Table: `licenses`

Stores license information from LemonSqueezy purchases.

```sql
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    lemonsqueezy_order_id VARCHAR(255) UNIQUE NOT NULL,
    lemonsqueezy_subscription_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_licenses_user_id ON licenses(user_id);
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_order_id ON licenses(lemonsqueezy_order_id);
```

### New Table: `user_subscriptions`

Tracks user subscription status and tier.

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',
    is_active BOOLEAN NOT NULL DEFAULT true,
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
```

### Update Table: `users`

```sql
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN has_lifetime_access BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
```

---

## Phase 2: Backend Implementation (Hono API)

### 1. Webhook Handler

**Endpoint**: `POST /webhooks/lemonsqueezy`

**Events to Handle**:
- `order_created` - New purchase, create license and activate subscription
- `order_refunded` - Refund processed, deactivate license
- `subscription_created` - Alternative path for license activation

**Key Implementation**:
- Verify webhook signature using HMAC-SHA256
- Implement idempotency (prevent duplicate processing)
- Use database transactions for atomic updates
- Handle unknown users (store pending license)

**Code Structure**:
```typescript
// apps/api/src/routes/webhooks.ts
app.post('/lemonsqueezy', async (c) => {
  // 1. Verify signature
  // 2. Check idempotency
  // 3. Process event
  // 4. Mark as processed
});
```

### 2. License Validation Endpoint

**Endpoint**: `GET /licenses/validate`

Returns user's subscription status for feature gating.

### 3. Checkout URL Generation

**Endpoint**: `POST /checkout`

Generates LemonSqueezy checkout URL with pre-filled user email.

### 4. Feature Gate Enforcement

Update existing endpoints to check subscription tier:
- `POST /workspaces` - Check free tier limit (1 workspace)
- `POST /workspaces/:id/projects` - Check free tier limit (3 projects)
- `POST /workspaces/:id/invitations` - Check free tier limit (2 members)

---

## Phase 3: Frontend Implementation

### Updated PricingModal.tsx

Replace "Coming Soon" with:
- Actual purchase CTA
- Remaining slots indicator
- "$28 Lifetime Access" button
- Urgency messaging

### New Components

1. **SubscriptionBadge.tsx** - Shows "Free" or "Lifetime" badge in header
2. **LicenseKeyInput.tsx** - Manual license entry (fallback for webhook failures)
3. **CheckoutSuccessPage** - `/checkout/success` - Activation confirmation
4. **CheckoutCancelPage** - `/checkout/cancel` - Purchase cancelled

### Auth Context Updates

Add to User type:
- `subscriptionTier: 'free' | 'lifetime'`
- `hasLifetimeAccess: boolean`

---

## Phase 4: LemonSqueezy Dashboard Setup

### 1. Create Store
- Store name: "Notto"
- Store URL: `notto.lemonsqueezy.com`
- Upload logo and set support email

### 2. Create Product
- Name: "Notto Lifetime Access"
- Enable License Keys (1 per customer, 16 characters)

### 3. Create Variant
- Name: "Founding Member Deal"
- Price: $28 USD (one-time payment)
- **Stock Quantity: 50** (enforces user limit)
- Description: "Limited time offer for first 50 users"

### 4. Configure Checkout
- Success URL: `https://yourdomain.com/checkout/success`
- Cancel URL: `https://yourdomain.com/checkout/cancel`

### 5. Configure Webhooks
- URL: `https://your-api-domain.com/webhooks/lemonsqueezy`
- Events: `order_created`, `order_refunded`, `subscription_created`
- Copy Signing Secret

### 6. Get API Credentials
- API Key (starts with `live_` or `test_`)
- Store ID (starts with `store_`)
- Product ID (starts with `product_`)
- Variant ID (starts with `variant_`)

---

## Phase 5: Environment Variables

### Backend (`apps/api/.env`)

```bash
LEMONSQUEEZY_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=store_xxxxxxxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_PRODUCT_ID=product_xxxxxxxxxx
LEMONSQUEEZY_VARIANT_ID=variant_xxxxxxxxxx
NODE_ENV=production
WEB_URL=https://yourdomain.com
```

### Frontend (`apps/web/.env`)

```bash
NEXT_PUBLIC_ENABLE_PRICING_GATE=true
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://notto.lemonsqueezy.com/checkout/buy/variant_xxxxxxxxxx
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

---

## Phase 6: Database Migration

**File**: `apps/api/drizzle/XXXX_add_licenses_and_subscriptions.sql`

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    lemonsqueezy_order_id VARCHAR(255) UNIQUE NOT NULL,
    lemonsqueezy_subscription_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    purchased_at TIMESTAMP NOT NULL DEFAULT NOW(),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',
    is_active BOOLEAN NOT NULL DEFAULT true,
    license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Create webhooks_processed table (for idempotency)
CREATE TABLE IF NOT EXISTS webhooks_processed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Run migration**:
```bash
cd apps/api
npx drizzle-kit push
```

---

## Phase 7: Testing Checklist

### Webhook Testing
- [ ] Test `order_created` webhook
- [ ] Test `order_refunded` webhook
- [ ] Verify signature validation
- [ ] Test idempotency (duplicate webhooks)
- [ ] Test with unknown user

### Purchase Flow
- [ ] Complete test purchase end-to-end
- [ ] Verify license created in database
- [ ] Verify subscription tier updates
- [ ] Test checkout success page
- [ ] Test checkout cancellation

### Feature Gates
Free Tier Limits:
- [ ] Block 2nd workspace
- [ ] Block 4th project
- [ ] Block 3rd team member

Lifetime Tier:
- [ ] Allow unlimited workspaces
- [ ] Allow unlimited projects
- [ ] Allow unlimited team members
- [ ] Show Lifetime badge

### Refunds
- [ ] Process refund in dashboard
- [ ] Verify webhook deactivates license
- [ ] Verify user reverts to free tier

---

## Phase 8: Post-Launch Monitoring

### Business Metrics
- Conversion rate (free → paid)
- Remaining lifetime slots
- Revenue per day/week
- Refund rate (target: <5%)

### Technical Metrics
- Webhook delivery success rate (target: >99%)
- Webhook processing latency (target: <500ms)
- License activation success rate

### Useful SQL Queries

```sql
-- Active lifetime users
SELECT COUNT(*) FROM users WHERE subscription_tier = 'lifetime';

-- Recent refunds
SELECT COUNT(*) FROM licenses 
WHERE status = 'refunded' AND refunded_at > NOW() - INTERVAL '30 days';

-- Revenue this month
SELECT COUNT(*) as sales, 
       COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunds
FROM licenses 
WHERE purchased_at > NOW() - INTERVAL '30 days';
```

---

## File Structure Summary

### New Files
```
apps/
├── api/
│   ├── src/routes/
│   │   ├── webhooks.ts        # LemonSqueezy webhook handler
│   │   ├── licenses.ts        # License validation
│   │   └── checkout.ts        # Checkout URL generation
│   ├── src/services/
│   │   └── lemonsqueezy.ts    # API client
│   └── drizzle/
│       └── XXXX_add_licenses_and_subscriptions.sql
├── web/
│   ├── src/components/
│   │   ├── PricingModal.tsx   # Updated with checkout
│   │   ├── SubscriptionBadge.tsx
│   │   └── LicenseKeyInput.tsx
│   ├── src/app/checkout/
│   │   ├── success/page.tsx
│   │   └── cancel/page.tsx
│   └── src/lib/
│       └── auth-context.tsx   # Add subscription fields
```

### Modified Files
```
apps/
├── api/
│   ├── src/routes/workspaces.ts    # Enforce limits
│   ├── src/routes/projects.ts      # Enforce limits
│   └── src/routes/invitations.ts   # Enforce limits
└── web/
    └── src/app/dashboard/layout.tsx # Add subscription badge
```

---

## Implementation Order

1. **Database**: Run migrations to add license tables
2. **Backend**: Create webhook handler and API routes
3. **Environment**: Add env variables (you'll enter your API key)
4. **Frontend**: Update PricingModal and add components
5. **LemonSqueezy**: Set up store, product, variant, webhooks
6. **Testing**: Test purchase flow end-to-end
7. **Launch**: Deploy and monitor

---

## Key Points

- **50 User Limit**: Enforced by LemonSqueezy stock count (no backend logic needed)
- **Hosted Checkout**: LemonSqueezy handles payment UI (easier implementation)
- **Webhook Security**: Always verify signatures to prevent spoofing
- **Idempotency**: Track processed webhooks to handle retries
- **Refunds**: 14-day policy automatically handled by webhook deactivation

---

*This plan was created on February 6, 2026 for the Notto screenshot annotation tool.*
