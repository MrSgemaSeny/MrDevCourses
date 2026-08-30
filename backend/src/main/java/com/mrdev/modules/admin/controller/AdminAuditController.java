package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.dto.PageResponse;
import com.mrdev.modules.admin.dto.AuditLogDto;
import com.mrdev.modules.admin.service.AdminAuditQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private final AdminAuditQueryService adminAuditQueryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<AuditLogDto> response = adminAuditQueryService.getAuditLogs(
                userId, action, entityType, from, to, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
