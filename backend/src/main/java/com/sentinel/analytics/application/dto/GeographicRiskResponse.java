package com.sentinel.analytics.application.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeographicRiskResponse {

    private String country;
    private long totalTransactions;
    private long flaggedTransactions;
    private double fraudRate;
}
