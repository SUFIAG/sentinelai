package com.sentinel.analytics.application.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalTransactions;
    private long flaggedTransactions;
    private long approvedTransactions;
    private long pendingTransactions;
    private long totalAlerts;
    private long openAlerts;
    private double averageRiskScore;
    private double fraudRate;
    private long totalAuditEvents;
}
