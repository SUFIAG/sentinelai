-- ==========================================
-- SENTINEL AI - COMPREHENSIVE DUMMY DATA
-- ==========================================
-- This script populates ALL tables with realistic test data
-- Run automatically on application startup
-- ==========================================

-- Set variables for organization
DO $$
DECLARE
    demo_org_id UUID := '11111111-1111-1111-1111-111111111111';
    admin_user_id UUID := '22222222-2222-2222-2222-222222222222';
    analyst_user_id UUID := '33333333-3333-3333-3333-333333333333';
    reviewer_user_id UUID := '44444444-4444-4444-4444-444444444444';

    transaction_ids UUID[];
    alert_ids UUID[];
    case_ids UUID[];

    i INT;
    txn_id UUID;
    alert_id UUID;
    case_id UUID;
BEGIN

    -- ==========================================
    -- PART 1: TRANSACTIONS (200 transactions)
    -- ==========================================
    RAISE NOTICE '📝 Creating 200 transactions...';

    FOR i IN 1..200 LOOP
        txn_id := gen_random_uuid();
        transaction_ids := array_append(transaction_ids, txn_id);

        INSERT INTO transactions (
            id,
            organization_id,
            transaction_external_id,
            user_id,
            merchant_id,
            amount,
            currency,
            country,
            device_id,
            ip_address,
            status,
            timestamp,
            created_at
        ) VALUES (
            txn_id,
            demo_org_id,
            'TXN-' || LPAD(i::text, 6, '0'),
            'USER-' || LPAD((RANDOM() * 100 + 1)::INT::text, 4, '0'),
            'MERCHANT-' || LPAD((RANDOM() * 50 + 1)::INT::text, 3, '0'),
            -- Amount: mix of small, medium, large, and suspicious amounts
            CASE
                WHEN RANDOM() < 0.7 THEN (RANDOM() * 500 + 10)::DECIMAL(15,2)  -- Normal: $10-$500
                WHEN RANDOM() < 0.9 THEN (RANDOM() * 2000 + 500)::DECIMAL(15,2) -- Medium: $500-$2500
                WHEN RANDOM() < 0.97 THEN (RANDOM() * 5000 + 2500)::DECIMAL(15,2) -- High: $2500-$7500
                ELSE (RANDOM() * 20000 + 10000)::DECIMAL(15,2)  -- Suspicious: $10k-$30k
            END,
            (ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD'])[FLOOR(RANDOM() * 5 + 1)],
            (ARRAY['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'CN', 'RU', 'BR', 'IN', 'MX'])[FLOOR(RANDOM() * 12 + 1)],
            'DEVICE-' || MD5(RANDOM()::TEXT || i::TEXT)::TEXT,
            (FLOOR(RANDOM() * 255 + 1))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255 + 1))::TEXT,
            -- Status: 80% approved, 12% flagged, 5% blocked, 3% pending
            CASE
                WHEN RANDOM() < 0.80 THEN 'APPROVED'
                WHEN RANDOM() < 0.92 THEN 'FLAGGED'
                WHEN RANDOM() < 0.97 THEN 'BLOCKED'
                ELSE 'PENDING'
            END,
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 200 transactions';

    -- ==========================================
    -- PART 2: RISK SCORES (for all transactions)
    -- ==========================================
    RAISE NOTICE '📝 Creating risk scores for all transactions...';

    INSERT INTO risk_scores (
        transaction_id,
        score,
        level,
        amount_risk,
        velocity_risk,
        location_risk,
        device_risk,
        history_risk,
        created_at
    )
    SELECT
        id as transaction_id,
        -- Risk score: 0-100 based on transaction characteristics
        LEAST(100, GREATEST(0,
            (CASE
                WHEN amount < 100 THEN 10
                WHEN amount < 500 THEN 20
                WHEN amount < 2000 THEN 40
                WHEN amount < 5000 THEN 60
                ELSE 85
            END) +
            (RANDOM() * 30 - 15)::INT  -- Add randomness
        ))::INT as score,
        -- Level based on score
        CASE
            WHEN amount < 100 AND RANDOM() < 0.9 THEN 'LOW'
            WHEN amount < 500 AND RANDOM() < 0.8 THEN 'LOW'
            WHEN amount < 2000 THEN 'MEDIUM'
            WHEN amount < 5000 THEN 'HIGH'
            ELSE 'CRITICAL'
        END as level,
        -- Individual risk components
        LEAST(100, (amount / 100)::INT) as amount_risk,
        (RANDOM() * 50)::INT as velocity_risk,
        CASE WHEN country IN ('CN', 'RU', 'BR') THEN (RANDOM() * 40 + 40)::INT ELSE (RANDOM() * 30)::INT END as location_risk,
        (RANDOM() * 40)::INT as device_risk,
        (RANDOM() * 30)::INT as history_risk,
        created_at
    FROM transactions
    WHERE organization_id = demo_org_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Created risk scores for all transactions';

    -- ==========================================
    -- PART 3: FRAUD ALERTS (40-50 alerts)
    -- ==========================================
    RAISE NOTICE '📝 Creating fraud alerts...';

    FOR txn_id IN
        SELECT id FROM transactions
        WHERE organization_id = demo_org_id
        AND status IN ('FLAGGED', 'BLOCKED')
        LIMIT 50
    LOOP
        alert_id := gen_random_uuid();
        alert_ids := array_append(alert_ids, alert_id);

        INSERT INTO fraud_alerts (
            id,
            organization_id,
            transaction_id,
            severity,
            status,
            reason,
            triggered_rules,
            created_at,
            updated_at,
            reviewed_by,
            reviewed_at
        ) VALUES (
            alert_id,
            demo_org_id,
            txn_id,
            (ARRAY['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])[FLOOR(RANDOM() * 4 + 1)],
            (ARRAY['OPEN', 'OPEN', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'])[FLOOR(RANDOM() * 6 + 1)],
            (ARRAY[
                'High transaction amount detected',
                'Unusual geographic location',
                'Velocity threshold exceeded',
                'Device fingerprint mismatch',
                'Suspicious merchant detected',
                'Multiple rapid transactions',
                'Amount significantly above user average',
                'Transaction from blacklisted country',
                'New device detected for high-value transaction',
                'Time-of-day anomaly detected'
            ])[FLOOR(RANDOM() * 10 + 1)],
            jsonb_build_array(
                jsonb_build_object(
                    'rule', (ARRAY['HIGH_AMOUNT', 'VELOCITY_CHECK', 'GEO_ANOMALY', 'DEVICE_MISMATCH', 'RISKY_MERCHANT'])[FLOOR(RANDOM() * 5 + 1)],
                    'triggered', true,
                    'threshold', (RANDOM() * 100)::INT
                )
            ),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '25 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '20 days'),
            -- 60% have been reviewed
            CASE WHEN RANDOM() < 0.6 THEN
                (ARRAY[admin_user_id, analyst_user_id, reviewer_user_id])[FLOOR(RANDOM() * 3 + 1)]
            ELSE NULL END,
            CASE WHEN RANDOM() < 0.6 THEN
                CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '15 days')
            ELSE NULL END
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created fraud alerts';

    -- ==========================================
    -- PART 4: AI EXPLANATIONS (for alerts)
    -- ==========================================
    RAISE NOTICE '📝 Creating AI explanations...';

    INSERT INTO ai_explanations (
        alert_id,
        cause,
        explanation,
        suggestion,
        confidence,
        provider,
        created_at
    )
    SELECT
        id as alert_id,
        CASE
            WHEN severity = 'CRITICAL' THEN 'Transaction amount significantly exceeds historical patterns for this user'
            WHEN severity = 'HIGH' THEN 'Multiple risk indicators triggered simultaneously'
            WHEN severity = 'MEDIUM' THEN 'Unusual transaction characteristics detected'
            ELSE 'Minor suspicious patterns observed'
        END as cause,
        'Based on analysis of ' || (RANDOM() * 1000 + 100)::INT || ' similar transactions, this transaction exhibits ' ||
        (RANDOM() * 5 + 2)::INT || ' anomalous features. ' ||
        'The risk score of ' || (RANDOM() * 100)::INT || ' indicates ' ||
        CASE
            WHEN severity IN ('CRITICAL', 'HIGH') THEN 'immediate attention required.'
            ELSE 'further investigation recommended.'
        END as explanation,
        (ARRAY[
            'Verify transaction with customer via phone',
            'Request additional identity verification',
            'Place temporary hold on account',
            'Contact merchant for verification',
            'Review user transaction history',
            'Check device fingerprint against known devices',
            'Investigate geographic location anomaly',
            'Flag for manual review by analyst team'
        ])[FLOOR(RANDOM() * 8 + 1)] as suggestion,
        (0.65 + RANDOM() * 0.30)::DECIMAL(3,2) as confidence,
        (ARRAY['rule-based', 'ml-model', 'hybrid'])[FLOOR(RANDOM() * 3 + 1)] as provider,
        created_at
    FROM fraud_alerts
    WHERE organization_id = demo_org_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Created AI explanations';

    -- ==========================================
    -- PART 5: USER PROFILES (100 profiles)
    -- ==========================================
    RAISE NOTICE '📝 Creating user behavioral profiles...';

    FOR i IN 1..100 LOOP
        INSERT INTO user_profiles (
            organization_id,
            user_id,
            average_transaction_amount,
            transaction_count,
            countries_json,
            devices_json,
            typical_transaction_hour,
            risk_score,
            last_updated,
            created_at
        ) VALUES (
            demo_org_id,
            'USER-' || LPAD(i::text, 4, '0'),
            (RANDOM() * 1000 + 50)::DECIMAL(15,2),
            (RANDOM() * 100 + 5)::INT,
            jsonb_build_array(
                jsonb_build_object('country', 'US', 'count', (RANDOM() * 50 + 10)::INT),
                jsonb_build_object('country', 'GB', 'count', (RANDOM() * 20 + 2)::INT)
            ),
            jsonb_build_array(
                jsonb_build_object('device_id', 'DEVICE-' || i || '-1', 'count', (RANDOM() * 80 + 20)::INT),
                jsonb_build_object('device_id', 'DEVICE-' || i || '-2', 'count', (RANDOM() * 30 + 5)::INT)
            ),
            (RANDOM() * 23)::INT,
            (RANDOM() * 100)::INT,
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '10 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '180 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 100 user profiles';

    -- ==========================================
    -- PART 6: DEVICES (150 devices)
    -- ==========================================
    RAISE NOTICE '📝 Creating device records...';

    FOR i IN 1..150 LOOP
        INSERT INTO devices (
            organization_id,
            user_id,
            fingerprint,
            first_seen,
            last_seen,
            usage_count,
            risk_score,
            is_blacklisted,
            trust_level,
            created_at
        ) VALUES (
            demo_org_id,
            'USER-' || LPAD((RANDOM() * 100 + 1)::INT::text, 4, '0'),
            MD5(RANDOM()::TEXT || i::TEXT)::TEXT,
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '180 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '5 days'),
            (RANDOM() * 100 + 1)::INT,
            (RANDOM() * 100)::INT,
            RANDOM() < 0.05,  -- 5% blacklisted
            (ARRAY['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'TRUSTED'])[FLOOR(RANDOM() * 5 + 1)],
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '180 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 150 device records';

    -- ==========================================
    -- PART 7: FRAUD CASES (30 cases)
    -- ==========================================
    RAISE NOTICE '📝 Creating fraud cases...';

    FOR i IN 1..30 LOOP
        case_id := gen_random_uuid();
        case_ids := array_append(case_ids, case_id);

        INSERT INTO fraud_cases (
            id,
            organization_id,
            alert_id,
            title,
            priority,
            status,
            assigned_to,
            created_by,
            created_at,
            updated_at,
            resolved_at,
            resolution
        ) VALUES (
            case_id,
            demo_org_id,
            (SELECT id FROM fraud_alerts WHERE organization_id = demo_org_id ORDER BY RANDOM() LIMIT 1),
            (ARRAY[
                'High-Value Transaction Investigation',
                'Velocity Abuse Pattern Detected',
                'Geographic Anomaly Analysis',
                'Merchant Fraud Investigation',
                'Account Takeover Suspected',
                'Card Testing Activity',
                'Refund Fraud Investigation',
                'Identity Theft Case',
                'Money Laundering Red Flag',
                'Chargeback Fraud Pattern'
            ])[FLOOR(RANDOM() * 10 + 1)] || ' - CASE' || LPAD(i::text, 4, '0'),
            (ARRAY['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])[FLOOR(RANDOM() * 4 + 1)],
            (ARRAY['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'])[FLOOR(RANDOM() * 4 + 1)],
            (ARRAY[admin_user_id, analyst_user_id, reviewer_user_id, NULL])[FLOOR(RANDOM() * 4 + 1)],
            (ARRAY[admin_user_id, analyst_user_id])[FLOOR(RANDOM() * 2 + 1)],
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '20 days'),
            CASE WHEN RANDOM() < 0.4 THEN CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '10 days') ELSE NULL END,
            CASE WHEN RANDOM() < 0.4 THEN
                (ARRAY['CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'CANNOT_DETERMINE', 'CUSTOMER_ERROR'])[FLOOR(RANDOM() * 4 + 1)]
            ELSE NULL END
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 30 fraud cases';

    -- ==========================================
    -- PART 8: CASE COMMENTS (100 comments)
    -- ==========================================
    RAISE NOTICE '📝 Creating case comments...';

    FOR i IN 1..100 LOOP
        INSERT INTO case_comments (
            case_id,
            user_id,
            content,
            created_at
        ) VALUES (
            (SELECT id FROM fraud_cases ORDER BY RANDOM() LIMIT 1),
            (ARRAY[admin_user_id, analyst_user_id, reviewer_user_id])[FLOOR(RANDOM() * 3 + 1)],
            (ARRAY[
                'Contacted customer - they confirmed this transaction.',
                'Called merchant - transaction appears legitimate.',
                'User unable to be reached. Escalating to supervisor.',
                'Customer denies making this transaction. Confirmed fraud.',
                'Additional verification documents requested from user.',
                'Pattern matches previous fraud case from last month.',
                'Device fingerprint does not match any known user devices.',
                'IP address traces to known VPN service - red flag.',
                'User has history of chargebacks. High risk customer.',
                'Transaction reversed. Customer account locked pending investigation.',
                'False positive - user was traveling. Case closed.',
                'Merchant confirms multiple similar transactions same day.',
                'Waiting for bank confirmation on card status.',
                'User profile updated with new device information.',
                'Similar pattern detected in 3 other recent transactions.',
                'Escalated to law enforcement. Police report filed.',
                'Customer provided receipt. Transaction legitimate.',
                'Account shows signs of credential stuffing attack.',
                'Implementing additional security measures for this account.',
                'Case resolved. No fraud detected. Closing.'
            ])[FLOOR(RANDOM() * 20 + 1)],
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '25 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 100 case comments';

    -- ==========================================
    -- PART 9: CASE HISTORY (150 history entries)
    -- ==========================================
    RAISE NOTICE '📝 Creating case history...';

    FOR i IN 1..150 LOOP
        INSERT INTO case_history (
            case_id,
            action,
            old_value,
            new_value,
            performed_by,
            performed_at
        ) VALUES (
            (SELECT id FROM fraud_cases ORDER BY RANDOM() LIMIT 1),
            (ARRAY[
                'STATUS_CHANGED',
                'ASSIGNED',
                'PRIORITY_CHANGED',
                'COMMENT_ADDED',
                'RESOLVED',
                'REOPENED',
                'ESCALATED'
            ])[FLOOR(RANDOM() * 7 + 1)],
            (ARRAY['OPEN', 'INVESTIGATING', 'MEDIUM', 'HIGH', NULL])[FLOOR(RANDOM() * 5 + 1)],
            (ARRAY['INVESTIGATING', 'RESOLVED', 'HIGH', 'CRITICAL', 'analyst@sentinel.ai'])[FLOOR(RANDOM() * 5 + 1)],
            (ARRAY[admin_user_id, analyst_user_id, reviewer_user_id])[FLOOR(RANDOM() * 3 + 1)],
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '25 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 150 case history entries';

    -- ==========================================
    -- PART 10: AUDIT TRAIL (300 entries)
    -- ==========================================
    RAISE NOTICE '📝 Creating audit trail...';

    FOR i IN 1..300 LOOP
        INSERT INTO audit_trail (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            decision_factors,
            reasoning,
            ip_address,
            result,
            timestamp
        ) VALUES (
            demo_org_id,
            (ARRAY[admin_user_id, analyst_user_id, reviewer_user_id, NULL])[FLOOR(RANDOM() * 4 + 1)],
            (ARRAY[
                'USER_LOGIN',
                'TRANSACTION_CREATED',
                'ALERT_GENERATED',
                'ALERT_REVIEWED',
                'CASE_CREATED',
                'CASE_UPDATED',
                'CASE_RESOLVED',
                'RULE_TRIGGERED',
                'RISK_SCORE_CALCULATED',
                'PROFILE_UPDATED'
            ])[FLOOR(RANDOM() * 10 + 1)],
            (ARRAY['TRANSACTION', 'ALERT', 'CASE', 'USER', 'PROFILE'])[FLOOR(RANDOM() * 5 + 1)],
            gen_random_uuid(),
            jsonb_build_object(
                'factor1', (RANDOM() * 100)::INT,
                'factor2', (RANDOM() * 100)::INT,
                'threshold', 75
            ),
            'Automated system action based on rule engine evaluation',
            (FLOOR(RANDOM() * 255 + 1))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255))::TEXT || '.' ||
            (FLOOR(RANDOM() * 255 + 1))::TEXT,
            (ARRAY['SUCCESS', 'FAILURE', 'PENDING'])[FLOOR(RANDOM() * 3 + 1)],
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
        );
    END LOOP;

    RAISE NOTICE '✅ Created 300 audit trail entries';

    -- ==========================================
    -- PART 11: IDEMPOTENCY KEYS
    -- ==========================================
    RAISE NOTICE '📝 Creating idempotency keys...';

    INSERT INTO idempotency_keys (
        idempotency_key,
        transaction_id,
        created_at,
        expires_at
    )
    SELECT
        'IDEM-' || MD5(RANDOM()::TEXT || id::TEXT),
        id,
        created_at,
        created_at + INTERVAL '24 hours'
    FROM transactions
    WHERE organization_id = demo_org_id
    AND RANDOM() < 0.5  -- 50% of transactions
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Created idempotency keys';

    -- ==========================================
    -- PART 12: MERCHANT RISK PROFILES
    -- ==========================================
    RAISE NOTICE '📝 Creating merchant risk profiles...';

    FOR i IN 1..50 LOOP
        INSERT INTO merchant_risk_profiles (
            organization_id,
            merchant_id,
            total_transactions,
            fraud_count,
            fraud_rate,
            risk_score,
            total_amount,
            avg_transaction_amount,
            is_blacklisted,
            first_seen,
            last_transaction,
            updated_at
        ) VALUES (
            demo_org_id,
            'MERCHANT-' || LPAD(i::text, 3, '0'),
            (RANDOM() * 200 + 10)::INT,
            (RANDOM() * 20 + 0)::INT,
            (RANDOM() * 30)::DECIMAL(5,2),
            (RANDOM() * 100)::INT,
            (RANDOM() * 100000 + 1000)::DECIMAL(15,2),
            (RANDOM() * 500 + 50)::DECIMAL(15,2),
            RANDOM() < 0.08,  -- 8% blacklisted
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '365 days'),
            CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '7 days'),
            CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 50 merchant risk profiles';

    -- ==========================================
    -- PART 13: COUNTRY RISK PROFILES
    -- ==========================================
    RAISE NOTICE '📝 Creating country risk profiles...';

    INSERT INTO country_risk_profiles (
        country,
        total_transactions,
        fraud_count,
        fraud_rate,
        risk_score,
        total_amount,
        is_high_risk,
        updated_at
    ) VALUES
        ('US', 5000, 150, 3.00, 30, 2500000.00, false, CURRENT_TIMESTAMP),
        ('GB', 2000, 60, 3.00, 30, 1000000.00, false, CURRENT_TIMESTAMP),
        ('CA', 1500, 45, 3.00, 30, 750000.00, false, CURRENT_TIMESTAMP),
        ('AU', 1000, 30, 3.00, 30, 500000.00, false, CURRENT_TIMESTAMP),
        ('DE', 1200, 36, 3.00, 30, 600000.00, false, CURRENT_TIMESTAMP),
        ('FR', 1100, 33, 3.00, 30, 550000.00, false, CURRENT_TIMESTAMP),
        ('JP', 800, 24, 3.00, 30, 400000.00, false, CURRENT_TIMESTAMP),
        ('CN', 500, 50, 10.00, 70, 300000.00, true, CURRENT_TIMESTAMP),
        ('RU', 300, 36, 12.00, 80, 200000.00, true, CURRENT_TIMESTAMP),
        ('BR', 400, 40, 10.00, 70, 250000.00, true, CURRENT_TIMESTAMP),
        ('IN', 600, 30, 5.00, 45, 350000.00, false, CURRENT_TIMESTAMP),
        ('MX', 350, 21, 6.00, 50, 180000.00, false, CURRENT_TIMESTAMP)
    ON CONFLICT (country) DO UPDATE SET
        total_transactions = EXCLUDED.total_transactions,
        fraud_count = EXCLUDED.fraud_count,
        fraud_rate = EXCLUDED.fraud_rate,
        risk_score = EXCLUDED.risk_score,
        total_amount = EXCLUDED.total_amount,
        is_high_risk = EXCLUDED.is_high_risk,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '✅ Created country risk profiles';

    -- ==========================================
    -- PART 14: DAILY ANALYTICS (Last 30 days)
    -- ==========================================
    RAISE NOTICE '📝 Creating daily analytics...';

    FOR i IN 0..29 LOOP
        INSERT INTO daily_analytics (
            organization_id,
            analytics_date,
            total_transactions,
            fraud_detected,
            false_positives,
            true_positives,
            fraud_rate,
            false_positive_rate,
            avg_risk_score,
            total_amount,
            fraud_amount,
            avg_processing_time_ms,
            unique_users,
            unique_merchants,
            created_at
        ) VALUES (
            demo_org_id,
            CURRENT_DATE - i,
            (RANDOM() * 150 + 50)::INT,
            (RANDOM() * 15 + 2)::INT,
            (RANDOM() * 5 + 1)::INT,
            (RANDOM() * 10 + 1)::INT,
            (RANDOM() * 10 + 1)::DECIMAL(5,2),
            (RANDOM() * 3 + 0.5)::DECIMAL(5,2),
            (RANDOM() * 50 + 20)::DECIMAL(5,2),
            (RANDOM() * 50000 + 10000)::DECIMAL(15,2),
            (RANDOM() * 10000 + 500)::DECIMAL(15,2),
            (RANDOM() * 100 + 10)::INT,
            (RANDOM() * 50 + 10)::INT,
            (RANDOM() * 30 + 5)::INT,
            CURRENT_TIMESTAMP
        ) ON CONFLICT (organization_id, analytics_date) DO NOTHING;
    END LOOP;

    RAISE NOTICE '✅ Created 30 days of daily analytics';

    -- ==========================================
    -- PART 15: RULE EFFECTIVENESS (Last 30 days)
    -- ==========================================
    RAISE NOTICE '📝 Creating rule effectiveness data...';

    FOR i IN 0..29 LOOP
        FOR rule_name IN SELECT unnest(ARRAY[
            'HIGH_AMOUNT_RULE',
            'VELOCITY_CHECK_RULE',
            'GEO_ANOMALY_RULE',
            'DEVICE_MISMATCH_RULE',
            'RISKY_MERCHANT_RULE',
            'TIME_ANOMALY_RULE'
        ])
        LOOP
            INSERT INTO rule_effectiveness (
                organization_id,
                rule_name,
                date,
                times_triggered,
                true_positives,
                false_positives,
                precision_rate,
                created_at,
                updated_at
            ) VALUES (
                demo_org_id,
                rule_name,
                CURRENT_DATE - i,
                (RANDOM() * 30 + 5)::INT,
                (RANDOM() * 15 + 2)::INT,
                (RANDOM() * 10 + 1)::INT,
                (RANDOM() * 40 + 50)::DECIMAL(5,2),
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            ) ON CONFLICT (organization_id, rule_name, date) DO NOTHING;
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ Created rule effectiveness data for 30 days';

    -- ==========================================
    -- PART 16: PERFORMANCE METRICS
    -- ==========================================
    RAISE NOTICE '📝 Creating performance metrics...';

    FOR i IN 1..100 LOOP
        INSERT INTO performance_metrics (
            metric_timestamp,
            metric_type,
            avg_latency_ms,
            p50_latency_ms,
            p95_latency_ms,
            p99_latency_ms,
            throughput_tps,
            error_count,
            success_count,
            created_at
        ) VALUES (
            CURRENT_TIMESTAMP - (i * INTERVAL '1 hour'),
            (ARRAY['transaction_processing', 'fraud_analysis', 'api_response'])[FLOOR(RANDOM() * 3 + 1)],
            (RANDOM() * 100 + 10)::INT,
            (RANDOM() * 50 + 5)::INT,
            (RANDOM() * 200 + 50)::INT,
            (RANDOM() * 500 + 100)::INT,
            (RANDOM() * 100 + 20)::INT,
            (RANDOM() * 5)::INT,
            (RANDOM() * 1000 + 500)::INT,
            CURRENT_TIMESTAMP - (i * INTERVAL '1 hour')
        );
    END LOOP;

    RAISE NOTICE '✅ Created 100 performance metric entries';

    -- ==========================================
    -- REFRESH MATERIALIZED VIEWS AND PROFILES
    -- ==========================================
    RAISE NOTICE '📝 Refreshing materialized views and risk profiles...';

    REFRESH MATERIALIZED VIEW dashboard_summary;
    REFRESH MATERIALIZED VIEW hourly_transaction_stats;
    PERFORM refresh_merchant_risk_profiles(demo_org_id);
    PERFORM refresh_country_risk_profiles();

    RAISE NOTICE '✅ Refreshed all views and profiles';

    -- ==========================================
    -- FINAL SUMMARY
    -- ==========================================
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║     🎉  SENTINEL AI - DATA SEEDING COMPLETE! 🎉        ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║  ✅ 200 Transactions                                   ║';
    RAISE NOTICE '║  ✅ 200 Risk Scores                                    ║';
    RAISE NOTICE '║  ✅ 40-50 Fraud Alerts                                 ║';
    RAISE NOTICE '║  ✅ 40-50 AI Explanations                              ║';
    RAISE NOTICE '║  ✅ 100 User Profiles                                  ║';
    RAISE NOTICE '║  ✅ 150 Devices                                        ║';
    RAISE NOTICE '║  ✅ 30 Fraud Cases                                     ║';
    RAISE NOTICE '║  ✅ 100 Case Comments                                  ║';
    RAISE NOTICE '║  ✅ 150 Case History Entries                           ║';
    RAISE NOTICE '║  ✅ 300 Audit Trail Entries                            ║';
    RAISE NOTICE '║  ✅ 100 Idempotency Keys                               ║';
    RAISE NOTICE '║  ✅ 50 Merchant Risk Profiles                          ║';
    RAISE NOTICE '║  ✅ 12 Country Risk Profiles                           ║';
    RAISE NOTICE '║  ✅ 30 Days Daily Analytics                            ║';
    RAISE NOTICE '║  ✅ 180 Rule Effectiveness Entries                     ║';
    RAISE NOTICE '║  ✅ 100 Performance Metrics                            ║';
    RAISE NOTICE '║                                                        ║';
    RAISE NOTICE '║  📊 TOTAL: 1,500+ Records Created                      ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';

END $$;

