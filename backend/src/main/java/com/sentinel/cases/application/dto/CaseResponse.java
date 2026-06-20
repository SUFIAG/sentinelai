package com.sentinel.cases.application.dto;

import com.sentinel.cases.domain.model.FraudCase;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseResponse {

    private UUID id;
    private UUID alertId;
    private String title;
    private String priority;
    private String status;
    private UUID assignedTo;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
    private String resolution;

    public static CaseResponse from(FraudCase fraudCase) {
        return CaseResponse.builder()
                .id(fraudCase.getId())
                .alertId(fraudCase.getAlertId())
                .title(fraudCase.getTitle())
                .priority(fraudCase.getPriority().name())
                .status(fraudCase.getStatus().name())
                .assignedTo(fraudCase.getAssignedTo())
                .createdBy(fraudCase.getCreatedBy())
                .createdAt(fraudCase.getCreatedAt())
                .updatedAt(fraudCase.getUpdatedAt())
                .resolvedAt(fraudCase.getResolvedAt())
                .resolution(fraudCase.getResolution() != null ? fraudCase.getResolution().name() : null)
                .build();
    }
}
