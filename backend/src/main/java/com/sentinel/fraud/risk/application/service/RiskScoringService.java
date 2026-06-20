package com.sentinel.fraud.risk.application.service;

import com.sentinel.behavioral.device.application.service.DeviceService;
import com.sentinel.behavioral.velocity.application.service.VelocityAnalyzer;
import com.sentinel.fraud.risk.adapter.out.persistence.RiskScoreRepository;
import com.sentinel.fraud.risk.domain.model.RiskLevel;
import com.sentinel.fraud.risk.domain.model.RiskScore;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskScoringService {

    private static final double AMOUNT_WEIGHT = 0.30;
    private static final double VELOCITY_WEIGHT = 0.20;
    private static final double LOCATION_WEIGHT = 0.20;
    private static final double DEVICE_WEIGHT = 0.15;
    private static final double HISTORY_WEIGHT = 0.15;

    private final RiskScoreRepository riskScoreRepository;
    private final DeviceService deviceService;
    private final VelocityAnalyzer velocityAnalyzer;

    @Transactional
    public RiskScore calculateAndSave(Transaction transaction, List<RuleResult> ruleResults) {
        int amountRisk = calculateAmountRisk(transaction);
        int velocityRisk = calculateVelocityRisk(transaction);
        int locationRisk = calculateLocationRisk(transaction, ruleResults);
        int deviceRisk = calculateDeviceRisk(transaction);
        int historyRisk = calculateHistoryRisk(transaction, ruleResults);

        int totalScore = (int) Math.round(
                amountRisk * AMOUNT_WEIGHT +
                velocityRisk * VELOCITY_WEIGHT +
                locationRisk * LOCATION_WEIGHT +
                deviceRisk * DEVICE_WEIGHT +
                historyRisk * HISTORY_WEIGHT
        );
        totalScore = Math.min(100, Math.max(0, totalScore));

        RiskScore riskScore = RiskScore.builder()
                .transactionId(transaction.getId())
                .score(totalScore)
                .level(RiskLevel.fromScore(totalScore))
                .amountRisk(amountRisk)
                .velocityRisk(velocityRisk)
                .locationRisk(locationRisk)
                .deviceRisk(deviceRisk)
                .historyRisk(historyRisk)
                .build();

        RiskScore saved = riskScoreRepository.save(riskScore);
        log.debug("Risk score {} ({}) for transaction {}", totalScore, saved.getLevel(), transaction.getId());
        return saved;
    }

    private int calculateAmountRisk(Transaction transaction) {
        BigDecimal amount = transaction.getAmount();
        if (amount.compareTo(new BigDecimal("10000")) >= 0) return 95;
        if (amount.compareTo(new BigDecimal("5000")) >= 0) return 70;
        if (amount.compareTo(new BigDecimal("2000")) >= 0) return 40;
        if (amount.compareTo(new BigDecimal("500")) >= 0) return 15;
        return 5;
    }

    private int calculateVelocityRisk(Transaction transaction) {
        return velocityAnalyzer.calculateVelocityRisk(transaction);
    }

    private int calculateLocationRisk(Transaction transaction, List<RuleResult> ruleResults) {
        return ruleResults.stream()
                .filter(r -> "GEOGRAPHIC_ANOMALY".equals(r.getRuleName()) && r.isTriggered())
                .findFirst()
                .map(RuleResult::getRiskContribution)
                .orElse(5);
    }

    private int calculateDeviceRisk(Transaction transaction) {
        return deviceService.assessAndRecord(transaction);
    }

    private int calculateHistoryRisk(Transaction transaction, List<RuleResult> ruleResults) {
        long triggeredCount = ruleResults.stream().filter(RuleResult::isTriggered).count();
        if (triggeredCount >= 3) return 90;
        if (triggeredCount >= 2) return 60;
        if (triggeredCount >= 1) return 30;
        return 5;
    }
}
