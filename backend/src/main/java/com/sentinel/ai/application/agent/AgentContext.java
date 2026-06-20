package com.sentinel.ai.application.agent;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Immutable snapshot of everything an agent needs to reason about a case.
 */
public record AgentContext(
        UUID caseId,
        UUID transactionId,
        String userId,
        String merchantId,
        BigDecimal amount,
        String currency,
        String country,
        String deviceId,
        int riskScore,
        String riskLevel,
        List<String> triggeredRules
) {
}
