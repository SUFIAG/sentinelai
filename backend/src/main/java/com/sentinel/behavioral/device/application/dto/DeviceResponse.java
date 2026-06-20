package com.sentinel.behavioral.device.application.dto;

import com.sentinel.behavioral.device.domain.model.Device;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceResponse {

    private UUID id;
    private String userId;
    private String fingerprint;
    private Instant firstSeen;
    private Instant lastSeen;
    private Long usageCount;
    private Integer riskScore;
    private boolean blacklisted;
    private String trustLevel;

    public static DeviceResponse from(Device device) {
        return DeviceResponse.builder()
                .id(device.getId())
                .userId(device.getUserId())
                .fingerprint(device.getFingerprint())
                .firstSeen(device.getFirstSeen())
                .lastSeen(device.getLastSeen())
                .usageCount(device.getUsageCount())
                .riskScore(device.getRiskScore())
                .blacklisted(device.isBlacklisted())
                .trustLevel(device.getTrustLevel().name())
                .build();
    }
}
