package com.sentinel.ai.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.ai.application.agent.AgentContext;
import com.sentinel.ai.application.agent.InvestigationAgent;
import com.sentinel.ai.application.agent.RecommendationAgent;
import com.sentinel.ai.application.agent.SummaryAgent;
import com.sentinel.ai.application.dto.CaseSummaryResponse;
import com.sentinel.ai.application.dto.InvestigationResponse;
import com.sentinel.ai.application.dto.RecommendationResponse;
import com.sentinel.ai.adapter.out.persistence.AiConversationRepository;
import com.sentinel.ai.domain.model.AgentType;
import com.sentinel.ai.domain.model.AiConversation;
import com.sentinel.alert.domain.model.FraudAlert;
import com.sentinel.alert.adapter.out.persistence.AlertRepository;
import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.cases.adapter.out.persistence.FraudCaseRepository;
import com.sentinel.cases.domain.model.FraudCase;
import com.sentinel.common.exception.BusinessException;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.fraud.risk.adapter.out.persistence.RiskScoreRepository;
import com.sentinel.fraud.risk.domain.model.RiskScore;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Orchestrates the AI investigation agents for a fraud case: gathers context,
 * runs the agents, persists the conversation for auditability and replay.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgentService {

    private final FraudCaseRepository fraudCaseRepository;
    private final AlertRepository alertRepository;
    private final TransactionRepository transactionRepository;
    private final RiskScoreRepository riskScoreRepository;
    private final AiConversationRepository conversationRepository;
    private final InvestigationAgent investigationAgent;
    private final RecommendationAgent recommendationAgent;
    private final SummaryAgent summaryAgent;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Transactional
    public InvestigationResponse investigate(UUID organizationId, UUID caseId) {
        AgentContext ctx = buildContext(organizationId, caseId);
        long start = System.currentTimeMillis();
        InvestigationResponse result = investigationAgent.investigate(ctx);
        persist(caseId, AgentType.INVESTIGATION, ctx.toString(), result,
                result.getConfidence(), result.getProvider(), start);
        auditService.logAction(organizationId, caseId, AuditAction.INVESTIGATION_COMPLETED, EntityType.CASE);
        return result;
    }

    @Transactional(readOnly = true)
    public InvestigationResponse getInvestigation(UUID organizationId, UUID caseId) {
        loadOwnedCase(organizationId, caseId);
        AiConversation conv = conversationRepository
                .findFirstByCaseIdAndAgentTypeOrderByCreatedAtDesc(caseId, AgentType.INVESTIGATION)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", caseId.toString()));
        return read(conv.getResponse(), InvestigationResponse.class);
    }

    @Transactional
    public RecommendationResponse recommend(UUID organizationId, UUID caseId) {
        AgentContext ctx = buildContext(organizationId, caseId);
        InvestigationResponse investigation = conversationRepository
                .findFirstByCaseIdAndAgentTypeOrderByCreatedAtDesc(caseId, AgentType.INVESTIGATION)
                .map(conv -> read(conv.getResponse(), InvestigationResponse.class))
                .orElseGet(() -> investigationAgent.investigate(ctx));

        long start = System.currentTimeMillis();
        RecommendationResponse result = recommendationAgent.recommend(ctx, investigation);
        persist(caseId, AgentType.RECOMMENDATION, null, result,
                result.getConfidence(), result.getProvider(), start);
        auditService.logAction(organizationId, caseId, AuditAction.RECOMMENDATION_GENERATED, EntityType.CASE);
        return result;
    }

    @Transactional
    public CaseSummaryResponse summarize(UUID organizationId, UUID caseId) {
        AgentContext ctx = buildContext(organizationId, caseId);
        InvestigationResponse investigation = conversationRepository
                .findFirstByCaseIdAndAgentTypeOrderByCreatedAtDesc(caseId, AgentType.INVESTIGATION)
                .map(conv -> read(conv.getResponse(), InvestigationResponse.class))
                .orElseGet(() -> investigationAgent.investigate(ctx));
        RecommendationResponse recommendation = recommendationAgent.recommend(ctx, investigation);

        long start = System.currentTimeMillis();
        CaseSummaryResponse result = summaryAgent.summarize(ctx, investigation, recommendation);
        persist(caseId, AgentType.SUMMARY, null, result, null, result.getProvider(), start);
        auditService.logAction(organizationId, caseId, AuditAction.SUMMARY_GENERATED, EntityType.CASE);
        return result;
    }

    private AgentContext buildContext(UUID organizationId, UUID caseId) {
        FraudCase fraudCase = loadOwnedCase(organizationId, caseId);
        if (fraudCase.getAlertId() == null) {
            throw new BusinessException("NO_ALERT", "Case is not linked to an alert; cannot build AI context");
        }
        FraudAlert alert = alertRepository.findById(fraudCase.getAlertId())
                .orElseThrow(() -> new ResourceNotFoundException("Alert", fraudCase.getAlertId().toString()));
        Transaction txn = transactionRepository.findById(alert.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", alert.getTransactionId().toString()));
        RiskScore risk = riskScoreRepository.findByTransactionId(txn.getId()).orElse(null);

        List<String> triggered = alert.getTriggeredRules() != null ? alert.getTriggeredRules() : List.of();

        return new AgentContext(
                caseId,
                txn.getId(),
                txn.getUserId(),
                txn.getMerchantId(),
                txn.getAmount(),
                txn.getCurrency(),
                txn.getCountry(),
                txn.getDeviceId(),
                risk != null ? risk.getScore() : 0,
                risk != null ? risk.getLevel().name() : "UNKNOWN",
                triggered
        );
    }

    private FraudCase loadOwnedCase(UUID organizationId, UUID caseId) {
        FraudCase fraudCase = fraudCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", caseId.toString()));
        if (!fraudCase.getOrganizationId().equals(organizationId)) {
            throw new ResourceNotFoundException("Case", caseId.toString());
        }
        return fraudCase;
    }

    private void persist(UUID caseId, AgentType type, String prompt, Object result,
                         java.math.BigDecimal confidence, String provider, long startMillis) {
        conversationRepository.save(AiConversation.builder()
                .caseId(caseId)
                .agentType(type)
                .prompt(prompt)
                .response(write(result))
                .confidence(confidence)
                .provider(provider != null ? provider : "rule-based")
                .durationMs((int) (System.currentTimeMillis() - startMillis))
                .build());
    }

    private String write(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }

    private <T> T read(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new BusinessException("DESERIALIZATION_ERROR",
                    "Failed to read persisted agent result: " + e.getMessage());
        }
    }
}
