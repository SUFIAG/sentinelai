package com.sentinel.ai.application.service;

import com.sentinel.ai.adapter.out.persistence.PatternRuleRepository;
import com.sentinel.ai.application.dto.PatternResponse;
import com.sentinel.ai.domain.model.PatternRule;
import com.sentinel.alert.adapter.out.persistence.AlertRepository;
import com.sentinel.alert.domain.model.FraudAlert;
import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Mines recent alerts for recurring rule combinations and persists them as
 * discovered patterns. This provides a feedback signal for rule tuning and
 * surfaces emerging fraud trends without an external ML pipeline.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatternDiscoveryService {

    private static final int ALERT_SAMPLE_SIZE = 500;
    private static final long MIN_OCCURRENCES = 3;

    private final AlertRepository alertRepository;
    private final PatternRuleRepository patternRuleRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<PatternResponse> list(UUID organizationId) {
        return patternRuleRepository.findByOrganizationIdOrderByOccurrencesDesc(organizationId)
                .stream().map(PatternResponse::from).toList();
    }

    @Transactional
    public List<PatternResponse> analyze(UUID organizationId) {
        List<FraudAlert> alerts = alertRepository
                .findByOrganizationIdOrderByCreatedAtDesc(organizationId, PageRequest.of(0, ALERT_SAMPLE_SIZE))
                .getContent();

        Map<String, Long> frequency = new HashMap<>();
        for (FraudAlert alert : alerts) {
            if (alert.getTriggeredRules() == null) continue;
            for (String rule : alert.getTriggeredRules()) {
                frequency.merge(rule, 1L, Long::sum);
            }
        }

        long sample = Math.max(alerts.size(), 1);
        Instant now = Instant.now();

        frequency.entrySet().stream()
                .filter(e -> e.getValue() >= MIN_OCCURRENCES)
                .forEach(e -> upsertPattern(organizationId, e.getKey(), e.getValue(), sample, now));

        auditService.logAction(organizationId, organizationId, AuditAction.PATTERN_DISCOVERED, EntityType.PATTERN);
        log.info("Pattern analysis for org {} over {} alerts produced {} candidate signals",
                organizationId, alerts.size(), frequency.size());
        return list(organizationId);
    }

    private void upsertPattern(UUID organizationId, String ruleName, long occurrences, long sample, Instant now) {
        String patternName = "FREQUENT_" + ruleName;
        PatternRule pattern = patternRuleRepository
                .findByOrganizationIdAndPatternName(organizationId, patternName)
                .orElseGet(() -> PatternRule.builder()
                        .organizationId(organizationId)
                        .patternName(patternName)
                        .build());

        BigDecimal confidence = BigDecimal.valueOf(Math.min(occurrences / (double) sample, 1.0))
                .setScale(2, RoundingMode.HALF_UP);

        pattern.setPatternDescription(String.format(
                "Rule '%s' triggered in %d of %d recent alerts", ruleName, occurrences, sample));
        pattern.setOccurrences(occurrences);
        pattern.setConfidence(confidence);
        pattern.setLastTriggered(now);
        patternRuleRepository.save(pattern);
    }
}
