package com.sentinel.ai.application.service;

import com.sentinel.ai.adapter.out.persistence.ExplanationRepository;
import com.sentinel.ai.application.dto.ExplanationResponse;
import com.sentinel.ai.domain.model.AiExplanation;
import com.sentinel.alert.domain.model.FraudAlert;
import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.fraud.risk.domain.model.RiskScore;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExplanationService {

    private final ExplanationRepository explanationRepository;
    private final AuditService auditService;

    @Transactional
    public AiExplanation generateExplanation(FraudAlert alert, Transaction transaction,
                                              RiskScore riskScore, List<RuleResult> triggeredRules) {
        String cause = buildCause(triggeredRules, riskScore);
        String explanation = buildExplanation(transaction, riskScore, triggeredRules);
        String suggestion = buildSuggestion(riskScore, triggeredRules);
        BigDecimal confidence = calculateConfidence(riskScore, triggeredRules);

        AiExplanation aiExplanation = AiExplanation.builder()
                .alertId(alert.getId())
                .cause(cause)
                .explanation(explanation)
                .suggestion(suggestion)
                .confidence(confidence)
                .provider("rule-based")
                .build();

        AiExplanation saved = explanationRepository.save(aiExplanation);
        auditService.logAction(transaction.getOrganizationId(), saved.getId(),
                AuditAction.EXPLANATION_GENERATED, EntityType.EXPLANATION);
        log.debug("Explanation generated for alert {} with confidence {}", alert.getId(), confidence);
        return saved;
    }

    @Transactional(readOnly = true)
    public ExplanationResponse findByAlertId(UUID alertId) {
        AiExplanation explanation = explanationRepository.findByAlertId(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Explanation", alertId.toString()));
        return ExplanationResponse.from(explanation);
    }

    private String buildCause(List<RuleResult> triggeredRules, RiskScore riskScore) {
        if (triggeredRules.isEmpty()) {
            return "Elevated risk score detected based on transaction characteristics.";
        }
        StringBuilder sb = new StringBuilder("Fraud indicators detected: ");
        triggeredRules.forEach(r -> sb.append(r.getRuleName()).append(" (").append(r.getReason()).append("); "));
        return sb.toString().trim();
    }

    private String buildExplanation(Transaction transaction, RiskScore riskScore, List<RuleResult> triggeredRules) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Transaction of $%s %s was flagged with a risk score of %d/%d (%s). ",
                transaction.getAmount(), transaction.getCurrency(),
                riskScore.getScore(), 100, riskScore.getLevel()));
        sb.append(String.format("Risk breakdown: Amount=%d, Velocity=%d, Location=%d, Device=%d, History=%d. ",
                riskScore.getAmountRisk(), riskScore.getVelocityRisk(),
                riskScore.getLocationRisk(), riskScore.getDeviceRisk(), riskScore.getHistoryRisk()));
        if (!triggeredRules.isEmpty()) {
            sb.append(String.format("%d fraud detection rule(s) triggered: ", triggeredRules.size()));
            triggeredRules.forEach(r -> sb.append(r.getRuleName()).append(", "));
        }
        return sb.toString().trim();
    }

    private String buildSuggestion(RiskScore riskScore, List<RuleResult> triggeredRules) {
        return switch (riskScore.getLevel()) {
            case CRITICAL -> "IMMEDIATE ACTION REQUIRED: Block transaction and contact account holder. " +
                    "Initiate fraud investigation immediately. Consider temporary account freeze.";
            case HIGH -> "Review transaction urgently. Contact customer for verification. " +
                    "Check for related suspicious activity on this account.";
            case MEDIUM -> "Monitor account activity closely. Consider requesting additional verification " +
                    "for future transactions from this user.";
            default -> "No immediate action required. Continue standard monitoring.";
        };
    }

    private BigDecimal calculateConfidence(RiskScore riskScore, List<RuleResult> triggeredRules) {
        double base = 0.60;
        double ruleBonus = Math.min(triggeredRules.size() * 0.08, 0.25);
        double scoreBonus = riskScore.getScore() > 80 ? 0.10 : riskScore.getScore() > 60 ? 0.05 : 0.0;
        double total = Math.min(base + ruleBonus + scoreBonus, 0.95);
        return BigDecimal.valueOf(total).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
