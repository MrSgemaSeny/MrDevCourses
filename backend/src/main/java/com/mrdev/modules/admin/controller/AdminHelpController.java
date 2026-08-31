package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.help.dto.HelpRequestDto;
import com.mrdev.modules.help.dto.ResolveHelpRequest;
import com.mrdev.modules.help.model.HelpRequestStatus;
import com.mrdev.modules.help.service.StudentHelpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/help-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHelpController {

    private final StudentHelpService studentHelpService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HelpRequestDto>>> getAllHelpRequests(
            @RequestParam(required = false) HelpRequestStatus status) {

        List<HelpRequestDto> list = studentHelpService.getAllHelpRequests(status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{requestId}/resolve")
    public ResponseEntity<ApiResponse<HelpRequestDto>> resolveHelpRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ResolveHelpRequest request) {

        Long adminId = SecurityUtils.getCurrentUserId();
        HelpRequestDto result = studentHelpService.resolveHelpRequest(requestId, adminId, request);
        return ResponseEntity.ok(ApiResponse.success("Тикет успешно обновлен", result));
    }
}
