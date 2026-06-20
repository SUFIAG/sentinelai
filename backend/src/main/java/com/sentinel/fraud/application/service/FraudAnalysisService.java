package com.sentinel.fraud.application.service;

import com.sentinel.ai.application.service.ExplanationService;
import com.sentinel.alert.application.service.AlertService;
import com.sentinel.alert.domain.model.FraudAlert;
import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.behavioral.profile.application.service.ProfileService;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.fraud.risk.application.service.RiskScoringService;
import com.sentinel.fraud.risk.domain.model.RiskScore;
import com.sentinel.fraud.rules.domain.model.RuleResult;
import com.sentinel.fraud.rules.domain.service.RuleEngine;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.application.service.TransactionService;
import com.sentinel.transaction.domain.model.Transaction;
import com.sentinel.transaction.domain.model.TransactionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudAnalysisService {

    private final TransactionRepository transactionRepository;
    private final RuleEngine ruleEngine;
    private final RiskScoringService riskScoringService;
    private final AlertService alertService;
    private final ExplanationService explanationService;
    private final TransactionService transactionService;
    private final AuditService auditService;
    private final ProfileService profileService;

    @Transactional
    public void analyzeTransaction(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", transactionId.toString()));

        List<RuleResult> allResults = ruleEngine.evaluate(transaction);
        List<RuleResult> triggeredRules = allResults.stream().filter(RuleResult::isTriggered).toList();

        RiskScore riskScore = riskScoringService.calculateAndSave(transaction, allResults);

        // Fold this transaction into the user's behavioral baseline.
        profileService.recordTransaction(transaction);

        auditService.logAction(transaction.getOrganizationId(), transactionId,
                AuditAction.TRANSACTION_ANALYZED, EntityType.TRANSACTION);

        if (riskScore.getScore() >= 60) {
            transactionService.updateStatus(transactionId, TransactionStatus.FLAGGED);

            FraudAlert alert = alertService.createAlertIfNeeded(transaction, riskScore, triggeredRules);
            if (alert != null) {
                explanationService.generateExplanation(alert, transaction, riskScore, triggeredRules);
            }

            auditService.logAction(transaction.getOrganizationId(), transactionId,
                    AuditAction.TRANSACTION_FLAGGED, EntityType.TRANSACTION);
        } else {
            transactionService.updateStatus(transactionId, TransactionStatus.APPROVED);
            auditService.logAction(transaction.getOrganizationId(), transactionId,
                    AuditAction.TRANSACTION_APPROVED, EntityType.TRANSACTION);
        }

        log.info("Transaction {} analyzed: score={} level={} triggeredRules={}",
                transactionId, riskScore.getScore(), riskScore.getLevel(), triggeredRules.size());
    }
}
