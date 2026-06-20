package com.sentinel.ai.application.dto;

import com.sentinel.ai.domain.model.PatternRule;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatternResponse {

    private UUID id;
    private String patternName;
    private String patternDescription;
    private long occurrences;
    private BigDecimal confidence;
    private Instant lastTriggered;

    public static PatternResponse from(PatternRule pattern) {
        return PatternResponse.builder()
                .id(pattern.getId())
                .patternName(pattern.getPatternName())
                .patternDescription(pattern.getPatternDescription())
                .occurrences(pattern.getOccurrences() != null ? pattern.getOccurrences() : 0L)
                .confidence(pattern.getConfidence())
                .lastTriggered(pattern.getLastTriggered())
                .build();
    }
}
