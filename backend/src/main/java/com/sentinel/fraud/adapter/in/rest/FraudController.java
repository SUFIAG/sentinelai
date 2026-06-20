package com.sentinel.fraud.adapter.in.rest;

import com.sentinel.common.dto.ApiResponse;
import com.sentinel.fraud.application.service.FraudAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fraud")
@RequiredArgsConstructor
public class FraudController {

    private final FraudAnalysisService fraudAnalysisService;

    @PostMapping("/analyze/{transactionId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> analyzeTransaction(
            @PathVariable UUID transactionId) {
        fraudAnalysisService.analyzeTransaction(transactionId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("status", "ANALYZED", "transactionId", transactionId.toString())));
    }
}
