-- Add subscription columns to users table
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
CREATE INDEX IF NOT EXISTS idx_licenses_order_id ON licenses(lemonsqueezy_order_id);

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
