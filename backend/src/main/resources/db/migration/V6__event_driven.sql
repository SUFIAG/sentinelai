-- =================================================================
-- V6: Event-Driven Architecture & Horizontal Scaling
-- Phase 6: Kafka, Redis, Event Sourcing, Autonomous Agents
-- =================================================================

-- =================================================================
-- EVENT STORE (Event Sourcing)
-- =================================================================

CREATE TABLE IF NOT EXISTS event_store (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL, -- Transaction ID, Case ID, etc.
    aggregate_type VARCHAR(50) NOT NULL, -- 'Transaction', 'FraudAlert', 'Case'
    event_type VARCHAR(100) NOT NULL, -- 'TransactionIngested', 'FraudDetected', 'CaseCreated'
    event_version INT NOT NULL DEFAULT 1,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payload JSONB NOT NULL, -- Complete event data
    metadata JSONB, -- {requestId, userId, ipAddress, etc.}
    actor VARCHAR(100), -- System, UserId, AgentName
    correlation_id UUID, -- For tracing related events
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_aggregate ON event_store(aggregate_id, aggregate_type);
CREATE INDEX idx_events_type ON event_store(event_type);
CREATE INDEX idx_events_timestamp ON event_store(timestamp DESC);
CREATE INDEX idx_events_correlation ON event_store(correlation_id);
CREATE INDEX idx_events_aggregate_type_time ON event_store(aggregate_type, aggregate_id, timestamp DESC);

COMMENT ON TABLE event_store IS
'Event sourcing store for complete audit trail and replay capability. Every decision is recorded as an event.';

-- =================================================================
-- EVENT SUBSCRIPTIONS (For event replay & projections)
-- =================================================================

CREATE TABLE IF NOT EXISTS event_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_name VARCHAR(100) NOT NULL UNIQUE,
    event_types JSONB NOT NULL, -- ['TransactionIngested', 'FraudDetected']
    last_processed_event_id BIGINT,
    last_processed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, FAILED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_subs_status ON event_subscriptions(status);

-- =================================================================
-- KAFKA MESSAGE LOG (For deduplication & monitoring)
-- =================================================================

CREATE TABLE IF NOT EXISTS kafka_message_log (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    topic VARCHAR(100) NOT NULL,
    partition INT NOT NULL,
    message_offset BIGINT NOT NULL,
    key VARCHAR(255),
    payload JSONB NOT NULL,
    headers JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED, RETRY
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kafka_log_message_id ON kafka_message_log(message_id);
CREATE INDEX idx_kafka_log_topic_offset ON kafka_message_log(topic, partition, message_offset);
CREATE INDEX idx_kafka_log_status ON kafka_message_log(processing_status, timestamp DESC);
CREATE INDEX idx_kafka_log_processed ON kafka_message_log(processed_at DESC) WHERE processed_at IS NOT NULL;

COMMENT ON TABLE kafka_message_log IS
'Kafka message processing log for exactly-once semantics and monitoring.';

-- =================================================================
-- AUTONOMOUS AGENT EXECUTIONS (Tracking agent decisions)
-- =================================================================

CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- 'InvestigationAgent', 'RemediationAgent', 'PatternDiscoveryAgent'
    transaction_id UUID,
    case_id UUID,
    alert_id UUID,
    execution_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_end TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING', -- RUNNING, COMPLETED, FAILED
    decision JSONB, -- Agent's decision/recommendation
    reasoning TEXT, -- Explanation of decision
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    action_taken VARCHAR(100), -- 'AUTO_BLOCKED', 'ESCALATED', 'MONITORED', 'CLOSED'
    llm_provider VARCHAR(50), -- 'OpenAI', 'Claude', 'RuleBased', 'Ollama'
    llm_model VARCHAR(100),
    llm_tokens_used INT,
    processing_time_ms INT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_exec_name ON agent_executions(agent_name);
CREATE INDEX idx_agent_exec_type ON agent_executions(agent_type, execution_start DESC);
CREATE INDEX idx_agent_exec_transaction ON agent_executions(transaction_id);
CREATE INDEX idx_agent_exec_case ON agent_executions(case_id);
CREATE INDEX idx_agent_exec_status ON agent_executions(status);
CREATE INDEX idx_agent_exec_action ON agent_executions(action_taken, execution_start DESC);

COMMENT ON TABLE agent_executions IS
'Tracks all autonomous agent executions for monitoring, debugging, and compliance.';

-- =================================================================
-- PATTERN LEARNING (ML-discovered patterns)
-- =================================================================

CREATE TABLE IF NOT EXISTS discovered_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50) NOT NULL, -- 'FRAUD_RING', 'VELOCITY_ABUSE', 'ACCOUNT_TAKEOVER'
    pattern_definition JSONB NOT NULL, -- Pattern characteristics
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    support_count INT NOT NULL DEFAULT 0, -- Number of cases supporting this pattern
    precision DECIMAL(5,4), -- True positive rate
    recall DECIMAL(5,4), -- Coverage rate
    discovered_by VARCHAR(50) NOT NULL, -- 'PatternDiscoveryAgent', 'MLModel'
    discovered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE', -- CANDIDATE, APPROVED, REJECTED, ACTIVE
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    last_seen TIMESTAMP,
    times_matched INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patterns_type ON discovered_patterns(pattern_type);
CREATE INDEX idx_patterns_status ON discovered_patterns(status);
CREATE INDEX idx_patterns_confidence ON discovered_patterns(confidence DESC);
CREATE INDEX idx_patterns_discovered ON discovered_patterns(discovered_at DESC);
CREATE INDEX idx_patterns_times_matched ON discovered_patterns(times_matched DESC);

COMMENT ON TABLE discovered_patterns IS
'Machine learning discovered fraud patterns. Agents learn from case investigations and propose new detection rules.';

-- =================================================================
-- FEEDBACK LOOP (Learning from outcomes)
-- =================================================================

CREATE TABLE IF NOT EXISTS feedback_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES fraud_alerts(id),
    case_id UUID,
    original_decision VARCHAR(50) NOT NULL, -- 'FLAGGED_AS_FRAUD', 'PASSED'
    actual_outcome VARCHAR(50) NOT NULL, -- 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'UNKNOWN'
    reviewed_by UUID REFERENCES users(id),
    review_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    rules_triggered JSONB, -- Which rules flagged this
    learning_applied BOOLEAN NOT NULL DEFAULT false,
    adjustments_made JSONB, -- What was learned/adjusted
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_alert ON feedback_events(alert_id);
CREATE INDEX idx_feedback_case ON feedback_events(case_id);
CREATE INDEX idx_feedback_outcome ON feedback_events(actual_outcome, review_timestamp DESC);
CREATE INDEX idx_feedback_learning ON feedback_events(learning_applied);

COMMENT ON TABLE feedback_events IS
'Feedback loop for machine learning. System learns from analyst decisions to improve accuracy.';

-- =================================================================
-- DISTRIBUTED LOCKS (For multi-instance coordination)
-- =================================================================

CREATE TABLE IF NOT EXISTS distributed_locks (
    lock_name VARCHAR(255) PRIMARY KEY,
    locked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_by VARCHAR(255) NOT NULL, -- Instance ID or hostname
    expires_at TIMESTAMP NOT NULL,
    lock_version INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_locks_expires ON distributed_locks(expires_at);

COMMENT ON TABLE distributed_locks IS
'Distributed locks for coordinating scheduled tasks across multiple instances (e.g., cache refresh, report generation).';

-- =================================================================
-- ASYNC JOB QUEUE (For long-running tasks)
-- =================================================================

CREATE TABLE IF NOT EXISTS async_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(100) NOT NULL, -- 'REPORT_GENERATION', 'BULK_ANALYSIS', 'ML_TRAINING'
    job_params JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED
    priority INT NOT NULL DEFAULT 5, -- 1 (highest) to 10 (lowest)
    assigned_to VARCHAR(255), -- Instance ID processing this job
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    result JSONB,
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3
);

CREATE INDEX idx_async_jobs_status ON async_jobs(status, priority DESC, created_at ASC);
CREATE INDEX idx_async_jobs_type ON async_jobs(job_type, status);
CREATE INDEX idx_async_jobs_created ON async_jobs(created_at DESC);

COMMENT ON TABLE async_jobs IS
'Async job queue for long-running background tasks. Supports multi-instance processing with retries.';

-- =================================================================
-- INSTANCE HEALTH (Service registry)
-- =================================================================

CREATE TABLE IF NOT EXISTS service_instances (
    id VARCHAR(255) PRIMARY KEY, -- Hostname or instance ID
    service_name VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'HEALTHY', -- HEALTHY, UNHEALTHY, STARTING, STOPPING
    version VARCHAR(50),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_instances_service ON service_instances(service_name, status);
CREATE INDEX idx_instances_heartbeat ON service_instances(last_heartbeat DESC);

COMMENT ON TABLE service_instances IS
'Service registry for tracking backend instances in multi-instance deployments.';

-- =================================================================
-- FUNCTIONS FOR EVENT SOURCING
-- =================================================================

-- Function to publish event (called by application)
CREATE OR REPLACE FUNCTION publish_event(
    p_aggregate_id UUID,
    p_aggregate_type VARCHAR(50),
    p_event_type VARCHAR(100),
    p_payload JSONB,
    p_actor VARCHAR(100) DEFAULT 'System',
    p_metadata JSONB DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO event_store (
        aggregate_id,
        aggregate_type,
        event_type,
        payload,
        actor,
        metadata,
        correlation_id
    ) VALUES (
        p_aggregate_id,
        p_aggregate_type,
        p_event_type,
        p_payload,
        p_actor,
        p_metadata,
        COALESCE(p_correlation_id, gen_random_uuid())
    ) RETURNING event_id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get event stream for an aggregate
CREATE OR REPLACE FUNCTION get_event_stream(
    p_aggregate_id UUID,
    p_aggregate_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE(
    event_id UUID,
    event_type VARCHAR(100),
    event_timestamp TIMESTAMP,
    payload JSONB,
    actor VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.event_id,
        e.event_type,
        e.timestamp AS event_timestamp,
        e.payload,
        e.actor
    FROM event_store e
    WHERE e.aggregate_id = p_aggregate_id
      AND (p_aggregate_type IS NULL OR e.aggregate_type = p_aggregate_type)
    ORDER BY e.timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- AUTOMATIC CLEANUP JOBS (Prevent unbounded growth)
-- =================================================================

-- Archive old events (keep last 90 days in hot storage)
CREATE TABLE IF NOT EXISTS event_store_archive (
    LIKE event_store INCLUDING ALL
);

COMMENT ON TABLE event_store_archive IS
'Archived events older than 90 days. Can be queried for compliance/audit but not used in replay.';

-- =================================================================
-- VIEWS FOR MONITORING
-- =================================================================

-- Agent performance view
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT
    agent_type,
    agent_name,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
    AVG(processing_time_ms) as avg_processing_ms,
    MAX(processing_time_ms) as max_processing_ms,
    AVG(confidence) as avg_confidence,
    COUNT(DISTINCT action_taken) as unique_actions
FROM agent_executions
WHERE execution_start > NOW() - INTERVAL '24 hours'
GROUP BY agent_type, agent_name;

-- Event processing throughput
CREATE OR REPLACE VIEW event_throughput AS
SELECT
    DATE_TRUNC('minute', e.timestamp) as minute_bucket,
    e.event_type,
    COUNT(*) as event_count,
    AVG(EXTRACT(EPOCH FROM (k.processed_at - e.timestamp))) as avg_latency_seconds
FROM event_store e
LEFT JOIN kafka_message_log k ON e.event_id::text = k.message_id
WHERE e.timestamp > NOW() - INTERVAL '1 hour'
GROUP BY DATE_TRUNC('minute', e.timestamp), e.event_type;

-- =================================================================
-- INITIAL SETUP
-- =================================================================

COMMENT ON SCHEMA public IS
'Phase 6: Event-Driven Architecture with Kafka, Event Sourcing, and Autonomous Agents. Designed for 10k+ TPS with horizontal scaling.';

