-- V7: SEED DATA
-- Organizations
INSERT INTO organizations (id, name, plan_type, enabled, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Demo Organization', 'ENTERPRISE', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
-- Users (Password: Admin@123)
INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, enabled, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin@sentinel.ai', '$2a$10$xQMNYlLJnAHGZKLvz8kT5uGwGKKLZC1k.pQJX3FzVxYQZ0qM1TnAq', 'Admin', 'User', 'ADMIN', true, NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'analyst@sentinel.ai', '$2a$10$xQMNYlLJnAHGZKLvz8kT5uGwGKKLZC1k.pQJX3FzVxYQZ0qM1TnAq', 'John', 'Analyst', 'ANALYST', true, NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'reviewer@sentinel.ai', '$2a$10$xQMNYlLJnAHGZKLvz8kT5uGwGKKLZC1k.pQJX3FzVxYQZ0qM1TnAq', 'Sarah', 'Reviewer', 'REVIEWER', true, NOW(), NOW())
ON CONFLICT (organization_id, email) DO NOTHING;
-- Transactions
INSERT INTO transactions (id, organization_id, transaction_external_id, user_id, merchant_id, amount, currency, country, device_id, ip_address, status, timestamp, created_at) VALUES
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-001', 'USER-10001', 'MERCH-501', 45.99, 'USD', 'US', 'DEV-001', '192.168.1.100', 'APPROVED', NOW() - INTERVAL '1 hour', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-002', 'USER-10002', 'MERCH-502', 129.50, 'USD', 'US', 'DEV-002', '192.168.1.101', 'APPROVED', NOW() - INTERVAL '2 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-003', 'USER-10003', 'MERCH-503', 89.99, 'USD', 'CA', 'DEV-003', '192.168.1.102', 'APPROVED', NOW() - INTERVAL '3 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-004', 'USER-10004', 'MERCH-504', 234.00, 'EUR', 'DE', 'DEV-004', '192.168.1.103', 'APPROVED', NOW() - INTERVAL '4 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-005', 'USER-10005', 'MERCH-505', 567.80, 'USD', 'US', 'DEV-005', '192.168.1.104', 'APPROVED', NOW() - INTERVAL '5 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-SUSP-001', 'USER-10001', 'MERCH-999', 9850.00, 'USD', 'US', 'DEV-001', '192.168.1.100', 'FLAGGED', NOW() - INTERVAL '6 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-SUSP-002', 'USER-10002', 'MERCH-998', 15000.00, 'EUR', 'RU', 'DEV-UNK', '45.123.67.89', 'FLAGGED', NOW() - INTERVAL '7 hours', NOW()),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TXN-REJ-001', 'USER-10003', 'MERCH-997', 7500.00, 'USD', 'NG', 'DEV-UNK2', '41.203.45.12', 'REJECTED', NOW() - INTERVAL '8 hours', NOW());
-- Login: admin@sentinel.ai / Admin@123
