-- =================================================================
-- V4: Advanced Analytics & Performance Optimization
-- Phase 4: Analytics Dashboard with Caching
-- =================================================================

-- =================================================================
-- MATERIALIZED VIEWS FOR DASHBOARD PERFORMANCE
-- =================================================================

-- Dashboard Summary (Refresh every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_summary AS
SELECT
    t.organization_id,
    DATE(t.created_at) as summary_date,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN fa.id IS NOT NULL THEN 1 END) as fraud_count,
    COALESCE(AVG(rs.score), 0) as avg_risk_score,
    COALESCE(SUM(t.amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN fa.id IS NOT NULL THEN t.amount ELSE 0 END), 0) as fraud_amount,
    COUNT(DISTINCT t.user_id) as unique_users,
    COUNT(DISTINCT t.merchant_id) as unique_merchants
FROM transactions t
LEFT JOIN fraud_alerts fa ON t.id = fa.transaction_id
LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
GROUP BY t.organization_id, DATE(t.created_at);

CREATE INDEX idx_dashboard_summary_org_date ON dashboard_summary(organization_id, summary_date DESC);

-- Hourly transaction statistics for trend analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_transaction_stats AS
SELECT
    t.organization_id,
    DATE_TRUNC('hour', t.created_at) as hour_bucket,
    COUNT(*) as transaction_count,
    COUNT(CASE WHEN fa.id IS NOT NULL THEN 1 END) as fraud_count,
    AVG(rs.score) as avg_risk_score,
    MAX(rs.score) as max_risk_score,
    MIN(rs.score) as min_risk_score
FROM transactions t
LEFT JOIN fraud_alerts fa ON t.id = fa.transaction_id
LEFT JOIN risk_scores rs ON t.id = rs.transaction_id
GROUP BY t.organization_id, DATE_TRUNC('hour', t.created_at);

CREATE INDEX idx_hourly_stats_org_hour ON hourly_transaction_stats(organization_id, hour_bucket DESC);

-- =================================================================
-- MERCHANT RISK PROFILES
-- =================================================================

CREATE TABLE IF NOT EXISTS merchant_risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    merchant_id VARCHAR(255) NOT NULL,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    fraud_count BIGINT NOT NULL DEFAULT 0,
    fraud_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    risk_score INT NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    avg_transaction_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_transaction TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, merchant_id)
);

CREATE INDEX idx_merchant_profiles_org ON merchant_risk_profiles(organization_id);
CREATE INDEX idx_merchant_profiles_risk ON merchant_risk_profiles(organization_id, risk_score DESC);
CREATE INDEX idx_merchant_profiles_fraud_rate ON merchant_risk_profiles(organization_id, fraud_rate DESC);
CREATE INDEX idx_merchant_profiles_blacklisted ON merchant_risk_profiles(organization_id, is_blacklisted);

-- =================================================================
-- COUNTRY RISK PROFILES
-- =================================================================

CREATE TABLE IF NOT EXISTS country_risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(2) NOT NULL UNIQUE,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    fraud_count BIGINT NOT NULL DEFAULT 0,
    fraud_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    risk_score INT NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_high_risk BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_country_profiles_risk ON country_risk_profiles(risk_score DESC);
CREATE INDEX idx_country_profiles_fraud_rate ON country_risk_profiles(fraud_rate DESC);
CREATE INDEX idx_country_profiles_high_risk ON country_risk_profiles(is_high_risk);

-- =================================================================
-- DAILY ANALYTICS SUMMARIES (For faster reporting)
-- =================================================================

CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    analytics_date DATE NOT NULL,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    fraud_detected BIGINT NOT NULL DEFAULT 0,
    false_positives BIGINT NOT NULL DEFAULT 0,
    true_positives BIGINT NOT NULL DEFAULT 0,
    fraud_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    false_positive_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    avg_risk_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    fraud_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    avg_processing_time_ms INT NOT NULL DEFAULT 0,
    unique_users BIGINT NOT NULL DEFAULT 0,
    unique_merchants BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, analytics_date)
);

CREATE INDEX idx_daily_analytics_org_date ON daily_analytics(organization_id, analytics_date DESC);

-- =================================================================
-- RULE EFFECTIVENESS TRACKING (For optimization)
-- =================================================================

CREATE TABLE IF NOT EXISTS rule_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    rule_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    times_triggered BIGINT NOT NULL DEFAULT 0,
    true_positives BIGINT NOT NULL DEFAULT 0,
    false_positives BIGINT NOT NULL DEFAULT 0,
    precision_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, rule_name, date)
);

CREATE INDEX idx_rule_effectiveness_org ON rule_effectiveness(organization_id);
CREATE INDEX idx_rule_effectiveness_date ON rule_effectiveness(organization_id, date DESC);
CREATE INDEX idx_rule_effectiveness_precision ON rule_effectiveness(precision_rate DESC);

-- =================================================================
-- PERFORMANCE METRICS (System monitoring)
-- =================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR(50) NOT NULL, -- 'transaction_processing', 'fraud_analysis', 'api_response'
    avg_latency_ms INT NOT NULL,
    p50_latency_ms INT NOT NULL,
    p95_latency_ms INT NOT NULL,
    p99_latency_ms INT NOT NULL,
    throughput_tps INT NOT NULL,
    error_count INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(metric_timestamp DESC);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type, metric_timestamp DESC);

-- =================================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =================================================================

-- Function to refresh merchant risk profiles
CREATE OR REPLACE FUNCTION refresh_merchant_risk_profiles(org_id UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO merchant_risk_profiles (
        organization_id,
        merchant_id,
        total_transactions,
        fraud_count,
        fraud_rate,
        risk_score,
        total_amount,
        avg_transaction_amount,
        last_transaction,
        updated_at
    )
    SELECT
        t.organization_id,
        t.merchant_id,
        COUNT(*) as total_transactions,
        COUNT(fa.id) as fraud_count,
        CASE
            WHEN COUNT(*) > 0 THEN (COUNT(fa.id)::decimal / COUNT(*)::decimal * 100)
            ELSE 0
        END as fraud_rate,
        CASE
            WHEN COUNT(*) > 0 THEN
                LEAST(100, GREATEST(0,
                    (COUNT(fa.id)::decimal / COUNT(*)::decimal * 100) * 2 +
                    (CASE WHEN COUNT(fa.id) > 10 THEN 20 ELSE 0 END)
                ))
            ELSE 0
        END as risk_score,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COALESCE(AVG(t.amount), 0) as avg_transaction_amount,
        MAX(t.created_at) as last_transaction,
        CURRENT_TIMESTAMP as updated_at
    FROM transactions t
    LEFT JOIN fraud_alerts fa ON t.id = fa.transaction_id
    WHERE (org_id IS NULL OR t.organization_id = org_id)
    GROUP BY t.organization_id, t.merchant_id
    ON CONFLICT (organization_id, merchant_id)
    DO UPDATE SET
        total_transactions = EXCLUDED.total_transactions,
        fraud_count = EXCLUDED.fraud_count,
        fraud_rate = EXCLUDED.fraud_rate,
        risk_score = EXCLUDED.risk_score,
        total_amount = EXCLUDED.total_amount,
        avg_transaction_amount = EXCLUDED.avg_transaction_amount,
        last_transaction = EXCLUDED.last_transaction,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh country risk profiles
CREATE OR REPLACE FUNCTION refresh_country_risk_profiles()
RETURNS VOID AS $$
BEGIN
    INSERT INTO country_risk_profiles (
        country,
        total_transactions,
        fraud_count,
        fraud_rate,
        risk_score,
        total_amount,
        is_high_risk,
        updated_at
    )
    SELECT
        t.country,
        COUNT(*) as total_transactions,
        COUNT(fa.id) as fraud_count,
        CASE
            WHEN COUNT(*) > 0 THEN (COUNT(fa.id)::decimal / COUNT(*)::decimal * 100)
            ELSE 0
        END as fraud_rate,
        CASE
            WHEN COUNT(*) > 0 THEN
                LEAST(100, GREATEST(0, (COUNT(fa.id)::decimal / COUNT(*)::decimal * 100) * 1.5))
            ELSE 0
        END as risk_score,
        COALESCE(SUM(t.amount), 0) as total_amount,
        CASE
            WHEN COUNT(fa.id)::decimal / NULLIF(COUNT(*), 0)::decimal > 0.05 THEN true
            ELSE false
        END as is_high_risk,
        CURRENT_TIMESTAMP as updated_at
    FROM transactions t
    LEFT JOIN fraud_alerts fa ON t.id = fa.transaction_id
    WHERE t.country IS NOT NULL
    GROUP BY t.country
    ON CONFLICT (country)
    DO UPDATE SET
        total_transactions = EXCLUDED.total_transactions,
        fraud_count = EXCLUDED.fraud_count,
        fraud_rate = EXCLUDED.fraud_rate,
        risk_score = EXCLUDED.risk_score,
        total_amount = EXCLUDED.total_amount,
        is_high_risk = EXCLUDED.is_high_risk,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- SCHEDULED REFRESH (Can be triggered by application or cron)
-- =================================================================

COMMENT ON FUNCTION refresh_merchant_risk_profiles IS
'Refreshes merchant risk profiles based on transaction history. Call this periodically (e.g., every hour).';

COMMENT ON FUNCTION refresh_country_risk_profiles IS
'Refreshes country risk profiles based on transaction history. Call this periodically (e.g., every hour).';

COMMENT ON MATERIALIZED VIEW dashboard_summary IS
'Materialized view for dashboard performance. Refresh with: REFRESH MATERIALIZED VIEW dashboard_summary;';

COMMENT ON MATERIALIZED VIEW hourly_transaction_stats IS
'Hourly transaction statistics for trend analysis. Refresh with: REFRESH MATERIALIZED VIEW hourly_transaction_stats;';

-- =================================================================
-- INITIAL DATA REFRESH
-- =================================================================

-- Refresh materialized views
REFRESH MATERIALIZED VIEW dashboard_summary;
REFRESH MATERIALIZED VIEW hourly_transaction_stats;

-- Generate initial risk profiles (if transactions exist)
SELECT refresh_merchant_risk_profiles();
SELECT refresh_country_risk_profiles();

