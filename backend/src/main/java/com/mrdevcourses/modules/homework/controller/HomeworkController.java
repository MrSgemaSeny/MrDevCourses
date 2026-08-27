package com.mrdevcourses.modules.homework.controller;

import com.mrdevcourses.common.dto.ApiResponse;
import com.mrdevcourses.common.util.SecurityUtils;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdevcourses.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdevcourses.modules.homework.service.AiCodeGraderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class HomeworkController {

    private final AiCodeGraderService aiCodeGraderService;

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/homework/submit")
    public ResponseEntity<ApiResponse<HomeworkSubmissionDto>> submitHomework(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @Valid @RequestBody HomeworkSubmitRequest request) {

        Role userRole = SecurityUtils.getCurrentUserRole();
        Long userId = SecurityUtils.getCurrentUserId();

        HomeworkSubmissionDto result = aiCodeGraderService.submitAndEvaluate(courseId, lessonId, userId, userRole, request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/courses/{courseId}/lessons/{lessonId}/homework/submissions")
    public ResponseEntity<ApiResponse<List<HomeworkSubmissionDto>>> getSubmissions(
            @PathVariable Long courseId,
            @PathVariable Long lessonId) {

        Long userId = SecurityUtils.getCurrentUserId();
        List<HomeworkSubmissionDto> list = aiCodeGraderService.getUserSubmissions(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/homework/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<HomeworkSubmissionDto>> getSubmission(
            @PathVariable Long submissionId) {

        Role userRole = SecurityUtils.getCurrentUserRole();
        Long userId = SecurityUtils.getCurrentUserId();

        HomeworkSubmissionDto dto = aiCodeGraderService.getSubmissionById(submissionId, userId, userRole);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
