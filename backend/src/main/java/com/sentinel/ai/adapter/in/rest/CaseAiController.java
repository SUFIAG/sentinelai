package com.sentinel.ai.adapter.in.rest;

import com.sentinel.ai.application.dto.CaseSummaryResponse;
import com.sentinel.ai.application.dto.InvestigationResponse;
import com.sentinel.ai.application.dto.RecommendationResponse;
import com.sentinel.ai.application.service.AgentService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases/{id}")
@RequiredArgsConstructor
public class CaseAiController {

    private final AgentService agentService;

    @PostMapping("/investigate")
    public ResponseEntity<ApiResponse<InvestigationResponse>> investigate(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(agentService.investigate(orgId, id)));
    }

    @GetMapping("/investigation")
    public ResponseEntity<ApiResponse<InvestigationResponse>> getInvestigation(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(agentService.getInvestigation(orgId, id)));
    }

    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<RecommendationResponse>> recommend(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(agentService.recommend(orgId, id)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CaseSummaryResponse>> summary(
            @PathVariable UUID id, Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(agentService.summarize(orgId, id)));
    }
}
