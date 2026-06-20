package com.sentinel.analytics.application.service;

import com.sentinel.alert.adapter.out.persistence.AlertRepository;
import com.sentinel.alert.domain.model.AlertStatus;
import com.sentinel.analytics.application.dto.DashboardResponse;
import com.sentinel.audit.adapter.out.persistence.AuditRepository;
import com.sentinel.fraud.risk.adapter.out.persistence.RiskScoreRepository;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.common.config.CacheConfig;
import com.sentinel.transaction.domain.model.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final AlertRepository alertRepository;
    private final RiskScoreRepository riskScoreRepository;
    private final AuditRepository auditRepository;

    @Cacheable(value = CacheConfig.DASHBOARD, key = "#organizationId")
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID organizationId) {
        Instant last24h = Instant.now().minus(Duration.ofHours(24));

        long totalTxn = transactionRepository.countByOrganizationIdSince(organizationId, last24h);
        long flagged = transactionRepository.countByOrganizationIdAndStatusSince(
                organizationId, TransactionStatus.FLAGGED, last24h);
        long approved = transactionRepository.countByOrganizationIdAndStatusSince(
                organizationId, TransactionStatus.APPROVED, last24h);
        long pending = transactionRepository.countByOrganizationIdAndStatusSince(
                organizationId, TransactionStatus.PENDING, last24h);

        long totalAlerts = alertRepository.countByOrganizationIdAndCreatedAtAfter(organizationId, last24h);
        long openAlerts = alertRepository.countOpenAlerts(organizationId);

        double avgRisk = riskScoreRepository.findAverageScoreSince(last24h);
        double fraudRate = totalTxn > 0 ? (double) flagged / totalTxn * 100 : 0.0;

        long auditEvents = auditRepository.countByOrganizationIdAndTimestampAfter(organizationId, last24h);

        return DashboardResponse.builder()
                .totalTransactions(totalTxn)
                .flaggedTransactions(flagged)
                .approvedTransactions(approved)
                .pendingTransactions(pending)
                .totalAlerts(totalAlerts)
                .openAlerts(openAlerts)
                .averageRiskScore(Math.round(avgRisk * 100.0) / 100.0)
                .fraudRate(Math.round(fraudRate * 100.0) / 100.0)
                .totalAuditEvents(auditEvents)
                .build();
    }
}
