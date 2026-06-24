-- Insert test users and organization for Sentinel
-- Password for all users: Admin@123 (hashed with BCrypt)

-- Insert organization
INSERT INTO organizations (id, name, tier, status, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Demo Organization', 'ENTERPRISE', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert users (password: Admin@123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status, created_at, updated_at)
VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
     'admin@sentinel.ai',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Admin', 'User', 'ADMIN', 'ACTIVE', NOW(), NOW()),

    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
     'analyst@sentinel.ai',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'John', 'Analyst', 'ANALYST', 'ACTIVE', NOW(), NOW()),

    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
     'reviewer@sentinel.ai',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'Sarah', 'Reviewer', 'REVIEWER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (id, organization_id, transaction_external_id, user_id, merchant_id,
                         amount, currency, country, status, timestamp, created_at)
VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-001', 'USER-001', 'MERCH-001',
     150.00, 'USD', 'US', 'APPROVED', NOW() - INTERVAL '1 hour', NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-002', 'USER-002', 'MERCH-002',
     2500.00, 'USD', 'US', 'FLAGGED', NOW() - INTERVAL '2 hours', NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-003', 'USER-003', 'MERCH-001',
     75.50, 'USD', 'US', 'APPROVED', NOW() - INTERVAL '3 hours', NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-004', 'USER-001', 'MERCH-003',
     5000.00, 'USD', 'CN', 'BLOCKED', NOW() - INTERVAL '30 minutes', NOW()),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-005', 'USER-004', 'MERCH-002',
     300.00, 'USD', 'US', 'APPROVED', NOW() - INTERVAL '15 minutes', NOW())
ON CONFLICT DO NOTHING;

-- Insert sample fraud alerts
INSERT INTO fraud_alerts (id, organization_id, transaction_id, alert_type, severity, status, message, created_at)
SELECT
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    t.id,
    'HIGH_AMOUNT',
    CASE
        WHEN t.amount > 4000 THEN 'CRITICAL'
        WHEN t.amount > 2000 THEN 'HIGH'
        ELSE 'MEDIUM'
    END,
    'OPEN',
    'Suspicious transaction detected: Amount exceeds normal threshold',
    NOW()
FROM transactions t
WHERE t.status IN ('FLAGGED', 'BLOCKED')
  AND NOT EXISTS (SELECT 1 FROM fraud_alerts WHERE transaction_id = t.id)
LIMIT 3;

-- Insert sample fraud cases
INSERT INTO fraud_cases (id, organization_id, case_number, title, description, fraud_type,
                        status, priority, created_by, created_at, updated_at)
VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
     'CASE-001', 'High Value Transaction Investigation',
     'Investigating large transaction from unusual location',
     'UNUSUAL_ACTIVITY', 'INVESTIGATING', 'HIGH',
     '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 day', NOW()),

    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
     'CASE-002', 'Velocity Abuse Pattern',
     'Multiple rapid transactions detected from same user',
     'VELOCITY_ABUSE', 'OPEN', 'MEDIUM',
     '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 hours', NOW())
ON CONFLICT DO NOTHING;

-- Verify data
SELECT 'Users Created:' as info, COUNT(*) as count FROM users WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Transactions Created:', COUNT(*) FROM transactions WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Alerts Created:', COUNT(*) FROM fraud_alerts WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'Cases Created:', COUNT(*) FROM fraud_cases WHERE organization_id = '11111111-1111-1111-1111-111111111111';

