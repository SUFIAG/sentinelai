package com.sentinel.auth.adapter.in.rest;

import com.sentinel.auth.application.dto.*;
import com.sentinel.auth.application.service.AuthService;
import com.sentinel.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final UUID DEFAULT_ORG_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @RequestBody @Valid RegisterRequest request,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrganizationId(httpRequest);
        UserResponse response = authService.register(request, orgId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest) {
        UUID orgId = extractOrganizationId(httpRequest);
        LoginResponse response = authService.login(request, orgId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @RequestBody @Valid TokenRefreshRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private UUID extractOrganizationId(HttpServletRequest request) {
        String orgId = request.getHeader("X-Organization-Id");
        if (orgId == null || orgId.isBlank()) {
            return DEFAULT_ORG_ID;
        }
        return UUID.fromString(orgId);
    }
}
