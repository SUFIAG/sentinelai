package com.sentinel.analytics.application.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantRiskResponse {

    private String merchantId;
    private long flaggedCount;
}
