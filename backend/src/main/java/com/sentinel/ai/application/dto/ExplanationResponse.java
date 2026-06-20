package com.sentinel.ai.application.dto;

import com.sentinel.ai.domain.model.AiExplanation;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExplanationResponse {

    private UUID id;
    private UUID alertId;
    private String cause;
    private String explanation;
    private String suggestion;
    private BigDecimal confidence;
    private String provider;
    private Instant createdAt;

    public static ExplanationResponse from(AiExplanation e) {
        return ExplanationResponse.builder()
                .id(e.getId())
                .alertId(e.getAlertId())
                .cause(e.getCause())
                .explanation(e.getExplanation())
                .suggestion(e.getSuggestion())
                .confidence(e.getConfidence())
                .provider(e.getProvider())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
