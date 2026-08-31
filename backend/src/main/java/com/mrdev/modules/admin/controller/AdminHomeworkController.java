package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.service.AiCodeGraderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/homeworks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHomeworkController {

    private final AiCodeGraderService homeworkService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HomeworkSubmissionDto>>> getHomeworks(
            @RequestParam(required = false) SubmissionStatus status) {

        List<HomeworkSubmissionDto> list = homeworkService.getAllSubmissions(status);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{submissionId}/review")
    public ResponseEntity<ApiResponse<HomeworkSubmissionDto>> reviewHomework(
            @PathVariable Long submissionId,
            @Valid @RequestBody AdminReviewHomeworkRequest request) {

        Long adminId = SecurityUtils.getCurrentUserId();
        HomeworkSubmissionDto result = homeworkService.reviewSubmission(submissionId, adminId, request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
