package com.sentinel.behavioral.profile.adapter.in.rest;

import com.sentinel.behavioral.profile.application.dto.UserProfileResponse;
import com.sentinel.behavioral.profile.application.service.ProfileService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @PathVariable String userId,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(profileService.get(orgId, userId)));
    }

    @PostMapping("/{userId}/analyze")
    public ResponseEntity<ApiResponse<UserProfileResponse>> analyzeProfile(
            @PathVariable String userId,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(profileService.rebuild(orgId, userId)));
    }
}
