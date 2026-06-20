package com.sentinel.cases.application.dto;

import com.sentinel.cases.domain.model.CaseHistory;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseHistoryResponse {

    private UUID id;
    private UUID caseId;
    private String action;
    private String oldValue;
    private String newValue;
    private UUID performedBy;
    private Instant performedAt;

    public static CaseHistoryResponse from(CaseHistory history) {
        return CaseHistoryResponse.builder()
                .id(history.getId())
                .caseId(history.getCaseId())
                .action(history.getAction())
                .oldValue(history.getOldValue())
                .newValue(history.getNewValue())
                .performedBy(history.getPerformedBy())
                .performedAt(history.getPerformedAt())
                .build();
    }
}
