-- Phase 5: AI Agents (conversation history + discovered patterns)

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES fraud_cases(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    response TEXT NOT NULL,
    confidence DECIMAL(3, 2),
    provider VARCHAR(50) NOT NULL DEFAULT 'rule-based',
    duration_ms INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_conversations_case ON ai_conversations(case_id, agent_type, created_at DESC);

CREATE TABLE pattern_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pattern_name VARCHAR(255) NOT NULL,
    pattern_description TEXT,
    occurrences BIGINT NOT NULL DEFAULT 0,
    confidence DECIMAL(3, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_triggered TIMESTAMP,
    UNIQUE(organization_id, pattern_name)
);

CREATE INDEX idx_patterns_org ON pattern_rules(organization_id, occurrences DESC);
