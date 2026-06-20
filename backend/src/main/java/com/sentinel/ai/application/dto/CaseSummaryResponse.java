package com.sentinel.ai.application.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseSummaryResponse {

    private UUID caseId;
    private String summary;
    private String provider;
}
