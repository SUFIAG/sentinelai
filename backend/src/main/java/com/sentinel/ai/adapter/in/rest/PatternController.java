package com.sentinel.ai.adapter.in.rest;

import com.sentinel.ai.application.dto.PatternResponse;
import com.sentinel.ai.application.service.PatternDiscoveryService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patterns")
@RequiredArgsConstructor
public class PatternController {

    private final PatternDiscoveryService patternDiscoveryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatternResponse>>> listPatterns(Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(patternDiscoveryService.list(orgId)));
    }

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<List<PatternResponse>>> analyzePatterns(Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(patternDiscoveryService.analyze(orgId)));
    }
}
