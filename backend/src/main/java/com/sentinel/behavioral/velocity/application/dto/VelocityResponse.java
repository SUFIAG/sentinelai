package com.sentinel.behavioral.velocity.application.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VelocityResponse {

    private String userId;

    private long count10Min;
    private long count1Hour;
    private long count24Hours;

    private BigDecimal amount10Min;
    private BigDecimal amount1Hour;
    private BigDecimal amount24Hours;

    private long distinctMerchants1Hour;
    private long distinctCountries1Hour;

    private int velocityRisk;
    private boolean rapidActivityDetected;
}
