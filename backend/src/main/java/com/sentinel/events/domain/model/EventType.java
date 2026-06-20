package com.sentinel.events.domain.model;

public enum EventType {
    TRANSACTION_INGESTED,
    TRANSACTION_ANALYZED,
    FRAUD_DETECTED,
    ALERT_CREATED,
    CASE_CREATED,
    CASE_RESOLVED,
    AUTO_REMEDIATION
}
