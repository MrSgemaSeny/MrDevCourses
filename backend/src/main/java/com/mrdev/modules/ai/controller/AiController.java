package com.mrdev.modules.ai.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.ai.dto.AiTutorRequest;
import com.mrdev.modules.ai.dto.AiTutorResponse;
import com.mrdev.modules.ai.service.AiTutorService;
import com.mrdev.modules.auth.model.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiTutorService aiTutorService;

    @PostMapping("/tutor")
    public ResponseEntity<ApiResponse<AiTutorResponse>> askTutor(@Valid @RequestBody AiTutorRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Role userRole = SecurityUtils.getCurrentUserRole();

        AiTutorResponse response = aiTutorService.askTutor(request, userId, userRole);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
