package com.sentinel.behavioral.device.application.service;

import com.sentinel.audit.application.service.AuditService;
import com.sentinel.audit.domain.model.AuditAction;
import com.sentinel.audit.domain.model.EntityType;
import com.sentinel.behavioral.device.adapter.out.persistence.DeviceRepository;
import com.sentinel.behavioral.device.application.dto.DeviceResponse;
import com.sentinel.behavioral.device.domain.model.Device;
import com.sentinel.behavioral.device.domain.model.TrustLevel;
import com.sentinel.common.config.CacheConfig;
import com.sentinel.common.exception.ResourceNotFoundException;
import com.sentinel.transaction.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Tracks devices per organization and derives a trust/risk signal used by the
 * risk scoring engine. Devices are upserted as transactions are analyzed.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceService {

    private static final int MISSING_DEVICE_RISK = 30;
    private static final int NEW_DEVICE_RISK = 40;
    private static final int TRUSTED_DEVICE_RISK = 5;
    private static final int UNKNOWN_DEVICE_RISK = 20;
    private static final int SUSPICIOUS_DEVICE_RISK = 60;
    private static final int BLACKLISTED_DEVICE_RISK = 100;

    private static final long TRUSTED_USAGE_THRESHOLD = 5;
    private static final Duration TRUSTED_AGE = Duration.ofDays(7);

    private final DeviceRepository deviceRepository;
    private final AuditService auditService;

    /**
     * Upserts the device referenced by a transaction and returns its current risk contribution.
     * Returns an elevated baseline when no device fingerprint is present.
     */
    @CacheEvict(value = CacheConfig.DEVICES, key = "#txn.organizationId + ':' + #txn.userId")
    @Transactional
    public int assessAndRecord(Transaction txn) {
        String fingerprint = txn.getDeviceId();
        if (fingerprint == null || fingerprint.isBlank()) {
            return MISSING_DEVICE_RISK;
        }

        Instant now = Instant.now();
        Device device = deviceRepository
                .findByOrganizationIdAndFingerprint(txn.getOrganizationId(), fingerprint)
                .orElse(null);

        if (device == null) {
            device = Device.builder()
                    .organizationId(txn.getOrganizationId())
                    .userId(txn.getUserId())
                    .fingerprint(fingerprint)
                    .firstSeen(now)
                    .lastSeen(now)
                    .usageCount(1L)
                    .blacklisted(false)
                    .trustLevel(TrustLevel.UNKNOWN)
                    .riskScore(NEW_DEVICE_RISK)
                    .build();
            deviceRepository.save(device);
            auditService.logAction(txn.getOrganizationId(), device.getId(),
                    AuditAction.DEVICE_TRACKED, EntityType.DEVICE);
            return NEW_DEVICE_RISK;
        }

        device.setLastSeen(now);
        device.setUsageCount(device.getUsageCount() + 1);

        if (device.isBlacklisted()) {
            device.setTrustLevel(TrustLevel.BLACKLISTED);
            device.setRiskScore(BLACKLISTED_DEVICE_RISK);
            deviceRepository.save(device);
            return BLACKLISTED_DEVICE_RISK;
        }

        TrustLevel level = deriveTrustLevel(device, now);
        device.setTrustLevel(level);
        int risk = riskForTrust(level);
        device.setRiskScore(risk);
        deviceRepository.save(device);
        return risk;
    }

    @Cacheable(value = CacheConfig.DEVICES, key = "#organizationId + ':' + #userId")
    @Transactional(readOnly = true)
    public List<DeviceResponse> findByUser(UUID organizationId, String userId) {
        return deviceRepository.findByOrganizationIdAndUserIdOrderByLastSeenDesc(organizationId, userId)
                .stream().map(DeviceResponse::from).toList();
    }

    @CacheEvict(value = CacheConfig.DEVICES, allEntries = true)
    @Transactional
    public DeviceResponse blacklist(UUID organizationId, UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", deviceId.toString()));
        if (!device.getOrganizationId().equals(organizationId)) {
            throw new ResourceNotFoundException("Device", deviceId.toString());
        }
        device.setBlacklisted(true);
        device.setTrustLevel(TrustLevel.BLACKLISTED);
        device.setRiskScore(BLACKLISTED_DEVICE_RISK);
        Device saved = deviceRepository.save(device);
        auditService.logAction(organizationId, saved.getId(),
                AuditAction.DEVICE_BLACKLISTED, EntityType.DEVICE);
        log.info("Device {} blacklisted for org {}", deviceId, organizationId);
        return DeviceResponse.from(saved);
    }

    private TrustLevel deriveTrustLevel(Device device, Instant now) {
        boolean aged = device.getFirstSeen() != null
                && Duration.between(device.getFirstSeen(), now).compareTo(TRUSTED_AGE) >= 0;
        if (device.getUsageCount() >= TRUSTED_USAGE_THRESHOLD && aged) {
            return TrustLevel.TRUSTED;
        }
        return TrustLevel.UNKNOWN;
    }

    private int riskForTrust(TrustLevel level) {
        return switch (level) {
            case TRUSTED -> TRUSTED_DEVICE_RISK;
            case SUSPICIOUS -> SUSPICIOUS_DEVICE_RISK;
            case BLACKLISTED -> BLACKLISTED_DEVICE_RISK;
            default -> UNKNOWN_DEVICE_RISK;
        };
    }
}
