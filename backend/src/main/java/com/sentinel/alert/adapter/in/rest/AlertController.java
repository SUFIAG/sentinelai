package com.sentinel.alert.adapter.in.rest;

import com.sentinel.alert.application.dto.AlertResponse;
import com.sentinel.alert.application.dto.UpdateAlertRequest;
import com.sentinel.alert.application.service.AlertService;
import com.sentinel.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AlertResponse>>> listAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AlertResponse> result = alertService.findByOrganization(orgId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AlertResponse>> getAlert(
            @PathVariable UUID id,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        AlertResponse response = alertService.findById(id, orgId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AlertResponse>> updateAlertStatus(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateAlertRequest request,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        AlertResponse response = alertService.updateStatus(id, orgId, request.getStatus(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
