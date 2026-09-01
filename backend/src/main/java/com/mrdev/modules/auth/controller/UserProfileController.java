package com.mrdev.modules.auth.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.auth.dto.UpdateUserProfileRequest;
import com.mrdev.modules.auth.dto.UserProfileDto;
import com.mrdev.modules.auth.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        UserProfileDto dto = userProfileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        UserProfileDto dto = userProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}