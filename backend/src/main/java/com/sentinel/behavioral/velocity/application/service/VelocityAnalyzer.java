package com.sentinel.behavioral.velocity.application.service;

import com.sentinel.behavioral.velocity.application.dto.VelocityResponse;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Sliding-window velocity analysis used to detect card-testing and rapid
 * fraud bursts. Windows are computed on demand against indexed transaction
 * data (user_id, timestamp) to keep write amplification at zero.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VelocityAnalyzer {

    private static final Duration WINDOW_10_MIN = Duration.ofMinutes(10);
    private static final Duration WINDOW_1_HOUR = Duration.ofHours(1);
    private static final Duration WINDOW_24_HOURS = Duration.ofHours(24);

    private final TransactionRepository transactionRepository;

    /**
     * Computes the velocity risk contribution (0-100) for the transaction's user.
     */
    public int calculateVelocityRisk(Transaction txn) {
        Instant now = Instant.now();
        long count10Min = transactionRepository.countRecentByUserId(txn.getUserId(), now.minus(WINDOW_10_MIN));
        long count1Hour = transactionRepository.countRecentByUserId(txn.getUserId(), now.minus(WINDOW_1_HOUR));

        if (count10Min >= 5) return 95;   // card testing burst
        if (count1Hour >= 10) return 95;  // sustained rapid fraud
        if (count1Hour >= 5) return 70;
        if (count1Hour >= 3) return 40;
        return 5;
    }

    @Transactional(readOnly = true)
    public VelocityResponse analyze(String userId) {
        Instant now = Instant.now();
        Instant since10Min = now.minus(WINDOW_10_MIN);
        Instant since1Hour = now.minus(WINDOW_1_HOUR);
        Instant since24Hours = now.minus(WINDOW_24_HOURS);

        long count10Min = transactionRepository.countRecentByUserId(userId, since10Min);
        long count1Hour = transactionRepository.countRecentByUserId(userId, since1Hour);
        long count24Hours = transactionRepository.countRecentByUserId(userId, since24Hours);

        int velocityRisk;
        if (count10Min >= 5) velocityRisk = 95;
        else if (count1Hour >= 10) velocityRisk = 95;
        else if (count1Hour >= 5) velocityRisk = 70;
        else if (count1Hour >= 3) velocityRisk = 40;
        else velocityRisk = 5;

        return VelocityResponse.builder()
                .userId(userId)
                .count10Min(count10Min)
                .count1Hour(count1Hour)
                .count24Hours(count24Hours)
                .amount10Min(transactionRepository.sumAmountByUserIdSince(userId, since10Min))
                .amount1Hour(transactionRepository.sumAmountByUserIdSince(userId, since1Hour))
                .amount24Hours(transactionRepository.sumAmountByUserIdSince(userId, since24Hours))
                .distinctMerchants1Hour(transactionRepository.countDistinctMerchantsByUserIdSince(userId, since1Hour))
                .distinctCountries1Hour(transactionRepository.countDistinctCountriesByUserIdSince(userId, since1Hour))
                .velocityRisk(velocityRisk)
                .rapidActivityDetected(count10Min >= 5 || count1Hour >= 10)
                .build();
    }
}
