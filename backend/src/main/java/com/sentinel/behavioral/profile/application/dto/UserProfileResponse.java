package com.sentinel.behavioral.profile.application.dto;

import com.sentinel.behavioral.profile.domain.model.UserProfile;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private UUID id;
    private String userId;
    private BigDecimal averageTransactionAmount;
    private Long transactionCount;
    private Set<String> countriesUsed;
    private Set<String> devicesUsed;
    private Integer typicalTransactionHour;
    private Integer riskScore;
    private Instant lastUpdated;

    public static UserProfileResponse from(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .averageTransactionAmount(profile.getAverageTransactionAmount())
                .transactionCount(profile.getTransactionCount())
                .countriesUsed(profile.getCountriesUsed())
                .devicesUsed(profile.getDevicesUsed())
                .typicalTransactionHour(profile.getTypicalTransactionHour())
                .riskScore(profile.getRiskScore())
                .lastUpdated(profile.getLastUpdated())
                .build();
    }
}
