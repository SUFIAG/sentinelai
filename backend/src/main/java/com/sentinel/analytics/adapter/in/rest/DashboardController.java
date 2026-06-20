package com.sentinel.analytics.adapter.in.rest;

import com.sentinel.analytics.application.dto.DashboardResponse;
import com.sentinel.analytics.application.dto.FraudTrendResponse;
import com.sentinel.analytics.application.dto.GeographicRiskResponse;
import com.sentinel.analytics.application.dto.MerchantRiskResponse;
import com.sentinel.analytics.application.service.DashboardService;
import com.sentinel.analytics.application.service.ReportingService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final ReportingService reportingService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        DashboardResponse response = dashboardService.getDashboard(orgId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardResponse>> getSummary(Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard(orgId)));
    }

    @GetMapping("/fraud-trend")
    public ResponseEntity<ApiResponse<FraudTrendResponse>> getFraudTrend(
            @RequestParam(defaultValue = "30") int days,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(reportingService.fraudTrend(orgId, days)));
    }

    @GetMapping("/top-merchants")
    public ResponseEntity<ApiResponse<List<MerchantRiskResponse>>> getTopMerchants(
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(reportingService.topRiskyMerchants(orgId, limit)));
    }

    @GetMapping("/geographic")
    public ResponseEntity<ApiResponse<List<GeographicRiskResponse>>> getGeographic(Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(reportingService.geographicBreakdown(orgId)));
    }
}
