package com.sentinel.ai.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationResponse {

    private UUID caseId;
    private boolean likelyFraud;
    private BigDecimal confidence;
    private List<String> keyIndicators;
    private String narrative;
    private String provider;
}
