package com.sentinel.analytics.application.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudTrendResponse {

    private List<DailyPoint> points;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyPoint {
        private LocalDate date;
        private long totalTransactions;
        private long flaggedTransactions;
        private double fraudRate;
    }
}
