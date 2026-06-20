package com.sentinel.ai.adapter.in.rest;

import com.sentinel.ai.application.dto.ExplanationResponse;
import com.sentinel.ai.application.service.ExplanationService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/explanations")
@RequiredArgsConstructor
public class ExplanationController {

    private final ExplanationService explanationService;

    @GetMapping("/alert/{alertId}")
    public ResponseEntity<ApiResponse<ExplanationResponse>> getByAlert(@PathVariable UUID alertId) {
        ExplanationResponse response = explanationService.findByAlertId(alertId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
