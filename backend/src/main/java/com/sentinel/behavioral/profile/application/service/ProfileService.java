package com.sentinel.behavioral.profile.application.service;

import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.behavioral.profile.adapter.out.persistence.UserProfileRepository;
import com.sentinel.behavioral.profile.application.dto.UserProfileResponse;
import com.sentinel.behavioral.profile.domain.model.UserProfile;
import com.sentinel.common.config.CacheConfig;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.transaction.adapter.out.persistence.TransactionRepository;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Builds and maintains behavioral baselines for each user.
 * Profiles are updated incrementally on each analyzed transaction
 * to avoid full history scans at high throughput.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final TransactionRepository transactionRepository;
    private final AuditService auditService;

    /**
     * Incrementally fold a freshly analyzed transaction into the user's profile.
     * Safe to call inline within the analysis pipeline.
     */
    @CacheEvict(value = CacheConfig.USER_PROFILES, key = "#txn.organizationId + ':' + #txn.userId")
    @Transactional
    public void recordTransaction(Transaction txn) {
        UserProfile profile = userProfileRepository
                .findByOrganizationIdAndUserId(txn.getOrganizationId(), txn.getUserId())
                .orElseGet(() -> newProfile(txn.getOrganizationId(), txn.getUserId()));

        long oldCount = profile.getTransactionCount() == null ? 0L : profile.getTransactionCount();
        BigDecimal oldAvg = profile.getAverageTransactionAmount() == null
                ? BigDecimal.ZERO : profile.getAverageTransactionAmount();

        long newCount = oldCount + 1;
        BigDecimal newTotal = oldAvg.multiply(BigDecimal.valueOf(oldCount)).add(txn.getAmount());
        profile.setAverageTransactionAmount(newTotal.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP));
        profile.setTransactionCount(newCount);

        if (profile.getCountriesUsed() == null) profile.setCountriesUsed(new HashSet<>());
        if (profile.getDevicesUsed() == null) profile.setDevicesUsed(new HashSet<>());
        if (txn.getCountry() != null && !txn.getCountry().isBlank()) profile.getCountriesUsed().add(txn.getCountry());
        if (txn.getDeviceId() != null && !txn.getDeviceId().isBlank()) profile.getDevicesUsed().add(txn.getDeviceId());

        profile.setTypicalTransactionHour(txn.getTimestamp().atZone(ZoneOffset.UTC).getHour());
        profile.setRiskScore(computeProfileRisk(profile));
        profile.setLastUpdated(Instant.now());

        userProfileRepository.save(profile);
    }

    /**
     * Full re-computation of a profile from the complete transaction history.
     */
    @CacheEvict(value = CacheConfig.USER_PROFILES, key = "#organizationId + ':' + #userId")
    @Transactional
    public UserProfileResponse rebuild(UUID organizationId, String userId) {
        List<Transaction> txns = transactionRepository.findByOrganizationIdAndUserId(organizationId, userId);
        UserProfile profile = userProfileRepository
                .findByOrganizationIdAndUserId(organizationId, userId)
                .orElseGet(() -> newProfile(organizationId, userId));

        BigDecimal total = BigDecimal.ZERO;
        Set<String> countries = new HashSet<>();
        Set<String> devices = new HashSet<>();
        int[] hourHistogram = new int[24];

        for (Transaction t : txns) {
            total = total.add(t.getAmount());
            if (t.getCountry() != null && !t.getCountry().isBlank()) countries.add(t.getCountry());
            if (t.getDeviceId() != null && !t.getDeviceId().isBlank()) devices.add(t.getDeviceId());
            hourHistogram[t.getTimestamp().atZone(ZoneOffset.UTC).getHour()]++;
        }

        profile.setTransactionCount((long) txns.size());
        profile.setAverageTransactionAmount(txns.isEmpty()
                ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(txns.size()), 2, RoundingMode.HALF_UP));
        profile.setCountriesUsed(countries);
        profile.setDevicesUsed(devices);
        profile.setTypicalTransactionHour(txns.isEmpty() ? null : mostFrequentHour(hourHistogram));
        profile.setRiskScore(computeProfileRisk(profile));
        profile.setLastUpdated(Instant.now());

        UserProfile saved = userProfileRepository.save(profile);
        auditService.logAction(organizationId, saved.getId(), AuditAction.PROFILE_UPDATED, EntityType.PROFILE);
        log.debug("Rebuilt profile for user {} from {} transactions", userId, txns.size());
        return UserProfileResponse.from(saved);
    }

    @Cacheable(value = CacheConfig.USER_PROFILES, key = "#organizationId + ':' + #userId")
    @Transactional(readOnly = true)
    public UserProfileResponse get(UUID organizationId, String userId) {
        UserProfile profile = userProfileRepository
                .findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", userId));
        return UserProfileResponse.from(profile);
    }

    /**
     * Returns true when the user has no established baseline (first-time user).
     */
    @Transactional(readOnly = true)
    public boolean isFirstTimeUser(UUID organizationId, String userId) {
        return userProfileRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .map(p -> p.getTransactionCount() == null || p.getTransactionCount() == 0L)
                .orElse(true);
    }

    private UserProfile newProfile(UUID organizationId, String userId) {
        return UserProfile.builder()
                .organizationId(organizationId)
                .userId(userId)
                .averageTransactionAmount(BigDecimal.ZERO)
                .transactionCount(0L)
                .countriesUsed(new HashSet<>())
                .devicesUsed(new HashSet<>())
                .riskScore(0)
                .lastUpdated(Instant.now())
                .build();
    }

    private int computeProfileRisk(UserProfile profile) {
        int risk = 0;
        if (profile.getCountriesUsed() != null && profile.getCountriesUsed().size() > 3) risk += 30;
        if (profile.getDevicesUsed() != null && profile.getDevicesUsed().size() > 3) risk += 30;
        long count = profile.getTransactionCount() == null ? 0L : profile.getTransactionCount();
        if (count < 5) risk += 20; // sparse history is riskier
        return Math.min(100, risk);
    }

    private int mostFrequentHour(int[] histogram) {
        int best = 0;
        for (int h = 1; h < histogram.length; h++) {
            if (histogram[h] > histogram[best]) best = h;
        }
        return best;
    }
}
