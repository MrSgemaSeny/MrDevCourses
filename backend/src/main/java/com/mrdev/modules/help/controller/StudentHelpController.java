package com.mrdev.modules.help.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.help.dto.CreateHelpRequest;
import com.mrdev.modules.help.dto.HelpRequestDto;
import com.mrdev.modules.help.service.StudentHelpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/courses/{courseId}/lessons/{lessonId}/help-requests")
@RequiredArgsConstructor
public class StudentHelpController {

    private final StudentHelpService studentHelpService;

    @PostMapping
    public ResponseEntity<ApiResponse<HelpRequestDto>> createHelpRequest(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateHelpRequest request) {

        Long userId = SecurityUtils.getCurrentUserId();
        Role role = SecurityUtils.getCurrentUserRole();

        HelpRequestDto dto = studentHelpService.createHelpRequest(courseId, lessonId, userId, role, request);
        return ResponseEntity.ok(ApiResponse.success("Запрос о помощи отправлен ментору", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HelpRequestDto>>> getLessonHelpRequests(
            @PathVariable Long courseId,
            @PathVariable Long lessonId) {

        Long userId = SecurityUtils.getCurrentUserId();
        List<HelpRequestDto> list = studentHelpService.getUserLessonHelpRequests(courseId, lessonId, userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
