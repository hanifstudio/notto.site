# LemonSqueezy Checkout URL Fix

## Problem

The checkout URL generation was using a static checkout link UUID instead of programmatically creating checkout sessions via the LemonSqueezy API, resulting in 404 errors.

## Root Cause

The original implementation tried to use:

```
https://notto.lemonsqueezy.com/checkout/buy/67419a6f-31f3-42f0-b44e-eaa010b45eff
```

This UUID (`67419a6f-31f3-42f0-b44e-eaa010b45eff`) is a **checkout link** from the "Share" button in LemonSqueezy dashboard, not a variant ID. Static checkout links don't support pre-filling user data or custom metadata.

## Solution

Rewrote `generateCheckoutUrl()` to use the **LemonSqueezy Checkouts API** to programmatically create checkout sessions.

### API Endpoint

```
POST https://api.lemonsqueezy.com/v1/checkouts
```

### Request Format

```json
{
  "data": {
    "type": "checkouts",
    "attributes": {
      "store_id": 283542,
      "variant_id": 1284568,
      "checkout_data": {
        "email": "user@example.com",
        "custom": [{ "user_id": "uuid" }]
      }
    }
  }
}
```

### Response

The API returns a unique checkout URL in `data.attributes.url` that:

- Pre-fills the user's email
- Includes custom metadata (user_id) for webhook processing
- Expires after a set time (default: 24 hours)
- Is unique per request

## Changes Made

### 1. Updated `apps/api/src/services/lemonsqueezy.ts`

- Changed `generateCheckoutUrl()` from synchronous to async
- Added API call to create checkout session
- Proper error handling and logging
- Returns dynamic checkout URL from API response

### 2. Updated `apps/api/src/routes/checkout.ts`

- Added `await` to `generateCheckoutUrl()` call

### 3. Fixed `apps/api/.env`

- Changed `LEMONSQUEEZY_VARIANT_ID` from checkout link UUID to actual variant ID
- Fixed typo: `LEMONSQUEEZY_STORE_ID` (was `LEMONSQUEEZY`)
- Removed duplicate `LEMONSQUEEZY_STORE_ID` entry

## Environment Variables

### Correct Values

```bash
LEMONSQUEEZY_STORE_ID=283542
LEMONSQUEEZY_VARIANT_ID=1284568
LEMONSQUEEZY_PRODUCT_ID=814882
```

### How to Find These

- **Store ID**: Visible in dashboard URL or API responses
- **Product ID**: From product URL: `https://app.lemonsqueezy.com/products/814882`
- **Variant ID**: From variant URL: `https://app.lemonsqueezy.com/products/814882/variants/1284568`

## Testing the Fix

### 1. Local Testing

```bash
cd apps/api
npm run dev
```

Then from frontend:

```javascript
const { checkoutUrl } = await apiClient.generateCheckoutUrl();
console.log(checkoutUrl); // Should be a valid LemonSqueezy URL
```

### 2. Expected Checkout URL Format

```
https://notto.lemonsqueezy.com/checkout/custom/[unique-id]?expires=[timestamp]&signature=[hash]
```

### 3. Verify Pre-filled Data

- Email should be pre-filled
- Custom user_id should be in webhook payload

## Next Steps

1. **Deploy Backend**: Push changes to Vercel
2. **Update Vercel Environment Variables**: Ensure all `LEMONSQUEEZY_*` variables are set correctly
3. **Test Complete Flow**:
   - Click "Get Lifetime Access" in PricingModal
   - Verify checkout URL is generated
   - Complete test purchase
   - Verify webhook activates license
4. **Configure Webhook in LemonSqueezy**:
   - URL: `https://your-api-domain.com/api/webhooks/lemonsqueezy`
   - Events: `license_key_created`, `order_refunded`
   - Secret: Same as `LEMONSQUEEZY_WEBHOOK_SECRET` in .env

## API Documentation Reference

- [Create a Checkout](https://docs.lemonsqueezy.com/api/checkouts/create-checkout)
- [The Checkout Object](https://docs.lemonsqueezy.com/api/checkouts)
- [Webhooks](https://docs.lemonsqueezy.com/api/webhooks)

## Security Notes

- API key is kept server-side only
- Checkout URLs expire automatically
- Webhook signatures are verified
- Custom data is encrypted in checkout URL

---

**Status**: ✅ Fixed and ready for deployment
**Date**: February 7, 2026
