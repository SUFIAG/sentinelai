package com.sentinel.ai.application.agent;

import com.sentinel.ai.adapter.out.llm.LlmClient;
import com.sentinel.ai.application.dto.InvestigationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Analyzes a flagged transaction and produces a structured investigation result.
 * Deterministic indicators/confidence are always computed from the evidence;
 * the LLM, when available, enriches the human-readable narrative.
 */
@Component
@RequiredArgsConstructor
public class InvestigationAgent {

    private final LlmClient llmClient;

    public InvestigationResponse investigate(AgentContext ctx) {
        List<String> indicators = buildIndicators(ctx);
        boolean likelyFraud = ctx.riskScore() >= 60 || indicators.size() >= 3;
        BigDecimal confidence = computeConfidence(ctx, indicators.size());

        String ruleNarrative = buildNarrative(ctx, indicators, likelyFraud);
        String narrative = llmClient.complete(systemPrompt(), userPrompt(ctx, indicators))
                .orElse(ruleNarrative);
        String provider = llmClient.isEnabled() ? "openai" : "rule-based";

        return InvestigationResponse.builder()
                .caseId(ctx.caseId())
                .likelyFraud(likelyFraud)
                .confidence(confidence)
                .keyIndicators(indicators)
                .narrative(narrative)
                .provider(provider)
                .build();
    }

    private List<String> buildIndicators(AgentContext ctx) {
        List<String> indicators = new ArrayList<>(ctx.triggeredRules() != null ? ctx.triggeredRules() : List.of());
        if (ctx.amount() != null && ctx.amount().compareTo(new BigDecimal("5000")) >= 0) {
            indicators.add("HIGH_TRANSACTION_AMOUNT");
        }
        if (ctx.deviceId() == null || ctx.deviceId().isBlank()) {
            indicators.add("MISSING_DEVICE_FINGERPRINT");
        }
        if ("CRITICAL".equalsIgnoreCase(ctx.riskLevel()) || "HIGH".equalsIgnoreCase(ctx.riskLevel())) {
            indicators.add("ELEVATED_RISK_SCORE");
        }
        return indicators.stream().distinct().toList();
    }

    private BigDecimal computeConfidence(AgentContext ctx, int indicatorCount) {
        double base = 0.50;
        double scoreBonus = Math.min(ctx.riskScore() / 100.0 * 0.30, 0.30);
        double indicatorBonus = Math.min(indicatorCount * 0.05, 0.20);
        double total = Math.min(base + scoreBonus + indicatorBonus, 0.98);
        return BigDecimal.valueOf(total).setScale(2, RoundingMode.HALF_UP);
    }

    private String buildNarrative(AgentContext ctx, List<String> indicators, boolean likelyFraud) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Transaction %s of %s %s at merchant %s (country %s) by user %s ",
                ctx.transactionId(), ctx.amount(), ctx.currency(), ctx.merchantId(),
                ctx.country() != null ? ctx.country() : "N/A", ctx.userId()));
        sb.append(String.format("scored %d (%s). ", ctx.riskScore(), ctx.riskLevel()));
        if (indicators.isEmpty()) {
            sb.append("No discrete fraud indicators were triggered. ");
        } else {
            sb.append("Indicators: ").append(String.join(", ", indicators)).append(". ");
        }
        sb.append(likelyFraud
                ? "Pattern is consistent with fraudulent activity and warrants investigation."
                : "Pattern appears low-risk; routine monitoring is advised.");
        return sb.toString();
    }

    private String systemPrompt() {
        return "You are a senior fraud investigation analyst. Given transaction evidence, "
                + "produce a concise, factual investigation narrative for a human reviewer. "
                + "Do not invent data beyond what is provided.";
    }

    private String userPrompt(AgentContext ctx, List<String> indicators) {
        return String.format(
                "Transaction: amount=%s %s, merchant=%s, country=%s, user=%s, device=%s.%n"
                        + "Risk score: %d (%s).%nTriggered indicators: %s.%n"
                        + "Write a 3-4 sentence investigation summary.",
                ctx.amount(), ctx.currency(), ctx.merchantId(),
                ctx.country(), ctx.userId(), ctx.deviceId(),
                ctx.riskScore(), ctx.riskLevel(),
                indicators.isEmpty() ? "none" : String.join(", ", indicators));
    }
}
