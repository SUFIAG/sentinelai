package com.sentinel.fraud.risk.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RiskLevel {
    LOW(0, 30, "Low risk - no action needed"),
    MEDIUM(31, 60, "Medium risk - monitor"),
    HIGH(61, 80, "High risk - review required"),
    CRITICAL(81, 100, "Critical risk - immediate action");

    private final int minScore;
    private final int maxScore;
    private final String description;

    public static RiskLevel fromScore(int score) {
        if (score <= 30) return LOW;
        if (score <= 60) return MEDIUM;
        if (score <= 80) return HIGH;
        return CRITICAL;
    }
}
