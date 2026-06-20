package com.sentinel.ai.application.agent;

import com.sentinel.ai.application.dto.InvestigationResponse;
import com.sentinel.ai.application.dto.RecommendationResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Maps an investigation result to a concrete resolution recommendation.
 * Thresholds mirror the roadmap's recommendation matrix.
 */
@Component
public class RecommendationAgent {

    public RecommendationResponse recommend(AgentContext ctx, InvestigationResponse investigation) {
        double confidence = investigation.getConfidence() != null
                ? investigation.getConfidence().doubleValue() : 0.0;
        int score = ctx.riskScore();

        String action;
        String reasoning;

        if (!investigation.isLikelyFraud() && confidence >= 0.95 && score < 30) {
            action = "AUTO_APPROVE";
            reasoning = "High confidence the transaction is legitimate with low risk score.";
        } else if (investigation.isLikelyFraud() && confidence >= 0.98 && score >= 90) {
            action = "AUTO_BLOCK";
            reasoning = "Critical risk with very high fraud confidence; block immediately.";
        } else if (confidence >= 0.80 && investigation.isLikelyFraud()) {
            action = "ESCALATE";
            reasoning = "Strong fraud signals but not conclusive; escalate to a senior analyst.";
        } else if (score >= 40) {
            action = "REQUEST_VERIFICATION";
            reasoning = "Medium risk; request additional verification from the customer.";
        } else {
            action = "MONITOR";
            reasoning = "Low confidence signals; add to watchlist and continue monitoring.";
        }

        return RecommendationResponse.builder()
                .caseId(ctx.caseId())
                .action(action)
                .confidence(BigDecimal.valueOf(confidence).setScale(2, java.math.RoundingMode.HALF_UP))
                .reasoning(reasoning)
                .provider(investigation.getProvider())
                .build();
    }
}
