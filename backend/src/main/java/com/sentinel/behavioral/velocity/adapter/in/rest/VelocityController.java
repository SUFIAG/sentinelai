package com.sentinel.behavioral.velocity.adapter.in.rest;

import com.sentinel.behavioral.velocity.application.dto.VelocityResponse;
import com.sentinel.behavioral.velocity.application.service.VelocityAnalyzer;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/velocity")
@RequiredArgsConstructor
public class VelocityController {

    private final VelocityAnalyzer velocityAnalyzer;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<VelocityResponse>> getVelocity(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(velocityAnalyzer.analyze(userId)));
    }
}
