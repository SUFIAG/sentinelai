package com.sentinel.analytics.application.service;

import com.sentinel.analytics.application.dto.FraudTrendResponse;
import com.sentinel.analytics.application.dto.GeographicRiskResponse;
import com.sentinel.analytics.application.dto.MerchantRiskResponse;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.TransactionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Generates business-intelligence reports from transaction analytics.
 */
@Service
@RequiredArgsConstructor
public class ReportingService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<MerchantRiskResponse> topRiskyMerchants(UUID organizationId, int limit) {
        return transactionRepository
                .findTopMerchantsByStatus(organizationId, TransactionStatus.FLAGGED, PageRequest.of(0, limit))
                .stream()
                .map(row -> MerchantRiskResponse.builder()
                        .merchantId((String) row[0])
                        .flaggedCount(asLong(row[1]))
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GeographicRiskResponse> geographicBreakdown(UUID organizationId) {
        return transactionRepository
                .findGeographicBreakdown(organizationId, TransactionStatus.FLAGGED)
                .stream()
                .map(row -> {
                    long total = asLong(row[1]);
                    long flagged = asLong(row[2]);
                    return GeographicRiskResponse.builder()
                            .country((String) row[0])
                            .totalTransactions(total)
                            .flaggedTransactions(flagged)
                            .fraudRate(total > 0 ? round(flagged * 100.0 / total) : 0.0)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public FraudTrendResponse fraudTrend(UUID organizationId, int days) {
        Instant since = Instant.now().minus(Duration.ofDays(days));
        List<FraudTrendResponse.DailyPoint> points = transactionRepository
                .findDailyFraudTrend(organizationId, since)
                .stream()
                .map(row -> {
                    long total = asLong(row[1]);
                    long flagged = asLong(row[2]);
                    return FraudTrendResponse.DailyPoint.builder()
                            .date(asLocalDate(row[0]))
                            .totalTransactions(total)
                            .flaggedTransactions(flagged)
                            .fraudRate(total > 0 ? round(flagged * 100.0 / total) : 0.0)
                            .build();
                })
                .toList();
        return FraudTrendResponse.builder().points(points).build();
    }

    private long asLong(Object value) {
        return value instanceof Number n ? n.longValue() : 0L;
    }

    private LocalDate asLocalDate(Object value) {
        if (value instanceof java.sql.Date d) return d.toLocalDate();
        if (value instanceof LocalDate ld) return ld;
        return LocalDate.parse(value.toString());
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
