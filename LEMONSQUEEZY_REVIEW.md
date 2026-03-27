# LemonSqueezy Implementation Review ✅

## Issues Found & Fixed

### ❌ Issue 1: Wrong Webhook Event

**Problem:** Code was listening to `order_created` event and expecting license keys in the payload, but `order_created` doesn't include license key data.

**Solution:** Changed to listen to `license_key_created` event which is specifically fired when a license key is generated.

**Events to Subscribe:**

- ✅ `license_key_created` - For activating licenses
- ✅ `order_refunded` - For handling refunds

### ❌ Issue 2: Incorrect Event Structure

**Problem:** TypeScript interface didn't match actual LemonSqueezy webhook payload structure.

**Solution:** Updated interfaces to match actual payloads:

- `LemonSqueezyLicenseKeyWebhookEvent` - For license_key_created
- `LemonSqueezyOrderWebhookEvent` - For order_refunded

### ❌ Issue 3: Order ID Extraction

**Problem:** For refunds, was trying to get `order_id` from attributes, but it's actually the event `data.id`.

**Solution:** Changed to use `event.data.id` for order refunds.

## ✅ Implementation Checklist

### Database Schema ✅

- [x] Added `subscriptionTier` and `hasLifetimeAccess` to users table
- [x] Created `licenses` table
- [x] Created `userSubscriptions` table
- [x] Created `webhooksProcessed` table for idempotency
- [x] Migration file ready: `0011_add_licenses_and_subscriptions.sql`

### Backend API ✅

- [x] Webhook signature verification (HMAC-SHA256)
- [x] Idempotency checking
- [x] License activation on `license_key_created` event
- [x] License deactivation on `order_refunded` event
- [x] Checkout URL generation with pre-filled email
- [x] License validation endpoint
- [x] Feature gating (workspaces: 1, projects: 3, members: 2)

### Frontend ✅

- [x] Updated PricingModal with checkout flow
- [x] Checkout success page with activation status
- [x] Checkout cancel page
- [x] SubscriptionBadge component
- [x] Auth context updated with subscription fields

### Environment Variables ✅

- [x] Backend `.env` with placeholders
- [x] Frontend `.env` with placeholders
- [x] `.env.example` files updated

## 🔧 Configuration Steps

### 1. Run Database Migration

```bash
cd apps/api
npx drizzle-kit push
```

### 2. LemonSqueezy Dashboard Setup

**Create Product:**

1. Go to Products → Create Product
2. Name: "Notto Lifetime Access"
3. Enable "License Keys"
   - 1 key per customer
   - 16 characters
   - Unlimited activations (or set limit as needed)

**Create Variant:**

1. Under the product, create a variant
2. Name: "Founding Member Deal"
3. Price: $28 USD (one-time)
4. Stock: 50 units ⚠️ **This enforces the 50-user limit**
5. Copy the variant ID (looks like `variant_123456`)

**Configure Webhook:**

1. Settings → Webhooks → Create Webhook
2. URL: `https://notto-api.vercel.app/api/webhooks/lemonsqueezy`
3. Secret: `notto_ls_wh_2024_secure_key_v1_prod_xyz` (or generate your own)
4. Events to subscribe:
   - ✅ `license_key_created`
   - ✅ `order_refunded`
5. Save and copy the secret

**Get API Credentials:**

1. Settings → API → Create API Key
2. Copy the API key (starts with `live_`)
3. Note your Store ID (visible in dashboard URL or API response)

### 3. Update Environment Variables

**Backend (`apps/api/.env`):**

```bash
LEMONSQUEEZY_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=notto_ls_wh_2024_secure_key_v1_prod_xyz
LEMONSQUEEZY_PRODUCT_ID=123456
LEMONSQUEEZY_VARIANT_ID=123456
```

**Frontend (`apps/web/.env`):**

```bash
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://notto.lemonsqueezy.com/checkout/buy/123456
```

### 4. Configure Checkout Redirect URLs

In LemonSqueezy product settings:

- Success URL: `https://notto.site/checkout/success`
- Cancel URL: `https://notto.site/checkout/cancel`

## 🧪 Testing Flow

### Test Purchase Flow

1. User clicks "Get Lifetime Access" in PricingModal
2. Frontend calls `POST /api/checkout` to generate checkout URL
3. User redirected to LemonSqueezy checkout
4. User completes purchase
5. LemonSqueezy fires `license_key_created` webhook
6. Backend activates license and updates user subscription
7. User redirected to `/checkout/success`
8. Success page validates license and redirects to dashboard

### Test Refund Flow

1. Process refund in LemonSqueezy dashboard
2. LemonSqueezy fires `order_refunded` webhook
3. Backend deactivates license and reverts user to free tier
4. User loses access to premium features

### Test Feature Gates

**Free Tier:**

- Try creating 2nd workspace → Should show pricing modal
- Try creating 4th project → Should show pricing modal
- Try inviting 3rd member → Should show pricing modal

**Lifetime Tier:**

- All limits removed
- Badge shows "Lifetime" instead of "Free"

## 🔒 Security Features

- ✅ HMAC-SHA256 webhook signature verification
- ✅ Idempotency tracking (prevents duplicate processing)
- ✅ Database transactions (atomic updates)
- ✅ User email verification before activation
- ✅ Secure token generation

## 📊 Monitoring Queries

```sql
-- Check active lifetime users
SELECT COUNT(*) FROM users WHERE subscription_tier = 'lifetime';

-- Check recent purchases
SELECT * FROM licenses
WHERE purchased_at > NOW() - INTERVAL '7 days'
ORDER BY purchased_at DESC;

-- Check refund rate
SELECT
  COUNT(*) as total_sales,
  COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunds
FROM licenses;

-- Check webhook processing
SELECT event_name, COUNT(*) as count
FROM webhooks_processed
GROUP BY event_name;
```

## ⚠️ Important Notes

1. **Variant ID is Required:** Even with one price, you must create a variant. The checkout URL uses the variant ID, not the product ID.

2. **Stock Limit:** Set variant stock to 50 to enforce the founding member limit. LemonSqueezy will automatically prevent purchases once sold out.

3. **Webhook Secret:** Use the same secret in both LemonSqueezy dashboard and your `.env` file. Max 40 characters.

4. **License Keys:** Enable license keys on the product, not the variant. Each purchase will generate one license key automatically.

5. **Event Order:** When a purchase happens:
   - `order_created` fires first
   - `license_key_created` fires second (this is what we use)

## 🚀 Deployment Checklist

- [ ] Deploy backend to Vercel
- [ ] Run database migration
- [ ] Add environment variables to Vercel
- [ ] Create product and variant in LemonSqueezy
- [ ] Configure webhook in LemonSqueezy
- [ ] Test webhook delivery (use LemonSqueezy test mode)
- [ ] Test complete purchase flow
- [ ] Test refund flow
- [ ] Verify feature gates work
- [ ] Monitor webhook logs

## ✅ Ready to Deploy!

The implementation is now correct and ready for deployment. All webhook events match LemonSqueezy's actual payload structure, and the flow is properly configured for lifetime license activation.
