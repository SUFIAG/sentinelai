package com.sentinel.ai.application.agent;

import com.sentinel.ai.adapter.out.llm.LlmClient;
import com.sentinel.ai.application.dto.CaseSummaryResponse;
import com.sentinel.ai.application.dto.InvestigationResponse;
import com.sentinel.ai.application.dto.RecommendationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Produces an executive, human-readable case summary combining the investigation
 * and recommendation. Uses the LLM when configured, otherwise composes a
 * deterministic summary.
 */
@Component
@RequiredArgsConstructor
public class SummaryAgent {

    private final LlmClient llmClient;

    public CaseSummaryResponse summarize(AgentContext ctx,
                                         InvestigationResponse investigation,
                                         RecommendationResponse recommendation) {
        String ruleSummary = buildRuleSummary(ctx, investigation, recommendation);
        String summary = llmClient.complete(systemPrompt(), userPrompt(ctx, investigation, recommendation))
                .orElse(ruleSummary);
        String provider = llmClient.isEnabled() ? "openai" : "rule-based";

        return CaseSummaryResponse.builder()
                .caseId(ctx.caseId())
                .summary(summary)
                .provider(provider)
                .build();
    }

    private String buildRuleSummary(AgentContext ctx, InvestigationResponse inv, RecommendationResponse rec) {
        return String.format(
                "WHAT: Transaction of %s %s at merchant %s by user %s.%n"
                        + "WHY FLAGGED: Risk score %d (%s); indicators: %s.%n"
                        + "FINDINGS: %s (confidence %s).%n"
                        + "RECOMMENDED ACTION: %s - %s",
                ctx.amount(), ctx.currency(), ctx.merchantId(), ctx.userId(),
                ctx.riskScore(), ctx.riskLevel(),
                inv.getKeyIndicators() == null || inv.getKeyIndicators().isEmpty()
                        ? "none" : String.join(", ", inv.getKeyIndicators()),
                inv.isLikelyFraud() ? "Likely fraudulent" : "Likely legitimate",
                inv.getConfidence(),
                rec.getAction(), rec.getReasoning());
    }

    private String systemPrompt() {
        return "You are a fraud operations lead. Summarize the case for an executive reviewer "
                + "in 4-5 sentences covering what happened, why it was flagged, the findings, "
                + "and the recommended action.";
    }

    private String userPrompt(AgentContext ctx, InvestigationResponse inv, RecommendationResponse rec) {
        return String.format(
                "Investigation narrative: %s%nLikely fraud: %s (confidence %s).%n"
                        + "Recommendation: %s - %s.",
                inv.getNarrative(), inv.isLikelyFraud(), inv.getConfidence(),
                rec.getAction(), rec.getReasoning());
    }
}
