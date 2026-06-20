-- Organizations (Multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'BASIC',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_enabled ON organizations(enabled);

-- Seed default organization
INSERT INTO organizations (id, name, plan_type, enabled)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization', 'ENTERPRISE', true);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'ANALYST',
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_enabled ON users(enabled);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_external_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    merchant_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    country VARCHAR(2),
    device_id VARCHAR(255),
    ip_address VARCHAR(45),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, transaction_external_id)
);

CREATE INDEX idx_transactions_org ON transactions(organization_id);
CREATE INDEX idx_transactions_ext_id ON transactions(organization_id, transaction_external_id);
CREATE INDEX idx_transactions_user_ts ON transactions(user_id, timestamp DESC);
CREATE INDEX idx_transactions_status ON transactions(status) WHERE status != 'APPROVED';
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Idempotency Keys
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_idempotency_key ON idempotency_keys(idempotency_key);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);

-- Risk Scores
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    level VARCHAR(20) NOT NULL,
    amount_risk INT NOT NULL,
    velocity_risk INT NOT NULL,
    location_risk INT NOT NULL,
    device_risk INT NOT NULL,
    history_risk INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_scores_transaction ON risk_scores(transaction_id);
CREATE INDEX idx_risk_scores_level_score ON risk_scores(level, score DESC);

-- Fraud Alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    reason TEXT NOT NULL,
    triggered_rules JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP
);

CREATE INDEX idx_alerts_org ON fraud_alerts(organization_id);
CREATE INDEX idx_alerts_status_severity ON fraud_alerts(status, severity, created_at DESC);
CREATE INDEX idx_alerts_transaction ON fraud_alerts(transaction_id);
CREATE INDEX idx_alerts_open ON fraud_alerts(created_at DESC) WHERE status IN ('OPEN', 'INVESTIGATING');

-- AI Explanations
CREATE TABLE ai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES fraud_alerts(id) ON DELETE CASCADE,
    cause TEXT NOT NULL,
    explanation TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    provider VARCHAR(50) NOT NULL DEFAULT 'rule-based',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_explanations_alert ON ai_explanations(alert_id);

-- Audit Trail
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    decision_factors JSONB,
    reasoning TEXT,
    ip_address VARCHAR(45),
    result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org_ts ON audit_trail(organization_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_trail(action, timestamp DESC);
