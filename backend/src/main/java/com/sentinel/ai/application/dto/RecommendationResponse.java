package com.sentinel.ai.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {

    private UUID caseId;
    /** One of: AUTO_APPROVE, AUTO_BLOCK, REQUEST_VERIFICATION, ESCALATE, MONITOR. */
    private String action;
    private BigDecimal confidence;
    private String reasoning;
    private String provider;
}
