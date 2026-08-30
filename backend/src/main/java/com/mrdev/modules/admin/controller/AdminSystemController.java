package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.RateLimitTelemetryDto;
import com.mrdev.modules.admin.dto.SystemHealthDto;
import com.mrdev.modules.admin.service.AdminSystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/system")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSystemController {

    private final AdminSystemService adminSystemService;

    @GetMapping("/rate-limits")
    public ResponseEntity<ApiResponse<RateLimitTelemetryDto>> getRateLimits() {
        RateLimitTelemetryDto telemetry = adminSystemService.getRateLimitsTelemetry();
        return ResponseEntity.ok(ApiResponse.success(telemetry));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<SystemHealthDto>> getHealth() {
        SystemHealthDto health = adminSystemService.getSystemHealth();
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}
