# LemonSqueezy Integration - Deployment Checklist

## Pre-Deployment

### 1. Database Migration

```bash
cd apps/api
npx drizzle-kit push
```

This will create:

- `licenses` table
- `user_subscriptions` table
- `webhooks_processed` table
- Add `subscription_tier` and `has_lifetime_access` columns to `users` table

### 2. Verify Environment Variables

**Backend (`apps/api/.env`):**

```bash
LEMONSQUEEZY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
LEMONSQUEEZY_STORE_ID=283542
LEMONSQUEEZY_WEBHOOK_SECRET=997ec277f448332a164fddd0e02bb25347a1e51c
LEMONSQUEEZY_PRODUCT_ID=814882
LEMONSQUEEZY_VARIANT_ID=1284568
```

**Frontend (`apps/web/.env`):**

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Deployment Steps

### 1. Deploy Backend to Vercel

```bash
cd apps/api
vercel --prod
```

**Important:** Add all environment variables in Vercel dashboard:

- Go to Project Settings → Environment Variables
- Add all `LEMONSQUEEZY_*` variables
- Add `DATABASE_URL`, `JWT_SECRET`, etc.

### 2. Deploy Frontend to Vercel

```bash
cd apps/web
vercel --prod
```

### 3. Configure LemonSqueezy Webhook

1. Go to [LemonSqueezy Dashboard](https://app.lemonsqueezy.com/settings/webhooks)
2. Click "Create Webhook"
3. **URL**: `https://your-api-domain.com/api/webhooks/lemonsqueezy`
4. **Secret**: Use the same value as `LEMONSQUEEZY_WEBHOOK_SECRET` in your .env
5. **Events to subscribe**:
   - ✅ `license_key_created`
   - ✅ `order_refunded`
6. Save webhook

### 4. Configure Product Redirect URLs

In LemonSqueezy product settings:

- **Success URL**: `https://notto.site/checkout/success`
- **Cancel URL**: `https://notto.site/checkout/cancel`

## Post-Deployment Testing

### 1. Test Checkout Flow

1. Log in to your app
2. Click "Get Lifetime Access" button
3. Verify checkout URL is generated (check browser console)
4. Complete test purchase with test card
5. Verify redirect to success page
6. Check database for license record

### 2. Test Webhook Delivery

1. Go to LemonSqueezy webhook settings
2. Click "Test" button
3. Check API logs for webhook processing
4. Verify no errors in logs

### 3. Test Feature Gates

**As Free User:**

- Try creating 2nd workspace → Should show pricing modal
- Try creating 4th project → Should show pricing modal
- Try inviting 3rd member → Should show pricing modal

**As Lifetime User:**

- Create multiple workspaces → Should work
- Create multiple projects → Should work
- Invite multiple members → Should work

### 4. Test Refund Flow

1. Process refund in LemonSqueezy dashboard
2. Verify webhook is received
3. Check user's subscription tier reverted to "free"
4. Verify feature gates are re-enabled

## Monitoring

### Check Active Licenses

```sql
SELECT COUNT(*) FROM licenses WHERE status = 'active';
```

### Check Recent Purchases

```sql
SELECT
  l.id,
  u.email,
  l.purchased_at,
  l.status
FROM licenses l
JOIN users u ON l.user_id = u.id
ORDER BY l.purchased_at DESC
LIMIT 10;
```

### Check Webhook Processing

```sql
SELECT
  event_name,
  COUNT(*) as count,
  MAX(processed_at) as last_processed
FROM webhooks_processed
GROUP BY event_name;
```

### Monitor Errors

Check Vercel logs for:

- Webhook signature verification failures
- License activation errors
- Checkout URL generation errors

## Troubleshooting

### Checkout URL Returns 404

**Cause**: Using static checkout link instead of API-generated URL

**Solution**: Verify `generateCheckoutUrl()` is using the Checkouts API (already fixed)

### Webhook Not Received

**Causes**:

1. Webhook URL incorrect
2. Webhook secret mismatch
3. Events not subscribed

**Solution**:

1. Verify webhook URL in LemonSqueezy dashboard
2. Check `LEMONSQUEEZY_WEBHOOK_SECRET` matches
3. Ensure `license_key_created` and `order_refunded` are checked

### License Not Activating

**Causes**:

1. User email doesn't match
2. Webhook processing error
3. Database transaction failed

**Solution**:

1. Check API logs for errors
2. Verify user exists with matching email
3. Check database for license record

### Feature Gates Not Working

**Cause**: User subscription tier not updated

**Solution**:

```sql
-- Check user's subscription
SELECT subscription_tier, has_lifetime_access FROM users WHERE email = 'user@example.com';

-- Manually update if needed (for testing only)
UPDATE users SET subscription_tier = 'lifetime', has_lifetime_access = true WHERE email = 'user@example.com';
```

## Rollback Plan

If issues occur:

1. **Disable webhook** in LemonSqueezy dashboard
2. **Hide pricing modal** by setting feature flag
3. **Revert database migration** if needed:
   ```sql
   DROP TABLE IF EXISTS webhooks_processed;
   DROP TABLE IF EXISTS user_subscriptions;
   DROP TABLE IF EXISTS licenses;
   ALTER TABLE users DROP COLUMN IF EXISTS subscription_tier;
   ALTER TABLE users DROP COLUMN IF EXISTS has_lifetime_access;
   ```

## Success Criteria

- ✅ Checkout URL generates successfully
- ✅ User can complete purchase
- ✅ License activates automatically via webhook
- ✅ User subscription tier updates to "lifetime"
- ✅ Feature gates are removed for lifetime users
- ✅ Refunds deactivate licenses correctly
- ✅ No errors in webhook processing logs

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check LemonSqueezy webhook delivery logs
3. Check database for license records
4. Review `LEMONSQUEEZY_CHECKOUT_FIX.md` for implementation details

---

**Ready to deploy!** 🚀
