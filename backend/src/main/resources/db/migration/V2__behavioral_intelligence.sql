-- Phase 2: Behavioral Intelligence (User Profiles, Devices)

-- User Profiles: per-user behavioral baseline
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    average_transaction_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    transaction_count BIGINT NOT NULL DEFAULT 0,
    countries_json JSONB NOT NULL DEFAULT '[]',
    devices_json JSONB NOT NULL DEFAULT '[]',
    typical_transaction_hour INT,
    risk_score INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_user_profiles_org_user ON user_profiles(organization_id, user_id);

-- Devices: fingerprint tracking and trust scoring
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usage_count BIGINT NOT NULL DEFAULT 1,
    risk_score INT NOT NULL DEFAULT 0,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    trust_level VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, fingerprint)
);

CREATE INDEX idx_devices_org_user ON devices(organization_id, user_id);
CREATE INDEX idx_devices_fingerprint ON devices(fingerprint);
CREATE INDEX idx_devices_blacklisted ON devices(organization_id) WHERE is_blacklisted = true;
