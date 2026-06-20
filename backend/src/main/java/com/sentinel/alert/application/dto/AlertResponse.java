package com.sentinel.alert.application.dto;

import com.sentinel.alert.domain.model.FraudAlert;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertResponse {

    private UUID id;
    private UUID transactionId;
    private String severity;
    private String status;
    private String reason;
    private List<String> triggeredRules;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID reviewedBy;
    private Instant reviewedAt;

    public static AlertResponse from(FraudAlert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .transactionId(alert.getTransactionId())
                .severity(alert.getSeverity().name())
                .status(alert.getStatus().name())
                .reason(alert.getReason())
                .triggeredRules(alert.getTriggeredRules())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .reviewedBy(alert.getReviewedBy())
                .reviewedAt(alert.getReviewedAt())
                .build();
    }
}
