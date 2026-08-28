package com.mrdev.modules.progress.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.progress.dto.CourseProgressDto;
import com.mrdev.modules.progress.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseProgressDto>>> getAllProgress() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<CourseProgressDto> progressList = progressService.getAllProgressForUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(progressList));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseProgressDto>> getProgressForCourse(@PathVariable Long courseId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CourseProgressDto courseProgress = progressService.getProgressForCourse(currentUserId, courseId);
        return ResponseEntity.ok(ApiResponse.success(courseProgress));
    }
}
