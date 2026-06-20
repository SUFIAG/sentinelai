package com.sentinel.behavioral.device.adapter.in.rest;

import com.sentinel.behavioral.device.application.dto.DeviceResponse;
import com.sentinel.behavioral.device.application.service.DeviceService;
import com.sentinel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getUserDevices(
            @PathVariable String userId,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(deviceService.findByUser(orgId, userId)));
    }

    @PostMapping("/{deviceId}/blacklist")
    public ResponseEntity<ApiResponse<DeviceResponse>> blacklistDevice(
            @PathVariable UUID deviceId,
            Authentication auth) {
        UUID orgId = UUID.fromString((String) auth.getCredentials());
        return ResponseEntity.ok(ApiResponse.success(deviceService.blacklist(orgId, deviceId)));
    }
}
