package com.mrdevcourses.modules.lesson.controller;

import com.mrdevcourses.common.dto.ApiResponse;
import com.mrdevcourses.common.util.SecurityUtils;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.lesson.dto.LessonDetailDto;
import com.mrdevcourses.modules.lesson.dto.LessonSummaryDto;
import com.mrdevcourses.modules.lesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/courses/{courseId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LessonSummaryDto>>> getLessons(@PathVariable Long courseId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role userRole = SecurityUtils.getCurrentUserRole();
        List<LessonSummaryDto> lessons = lessonService.getLessonsForCourse(courseId, currentUserId, userRole);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<ApiResponse<LessonDetailDto>> getLessonDetail(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role userRole = SecurityUtils.getCurrentUserRole();
        LessonDetailDto lesson = lessonService.getLessonDetail(courseId, lessonId, currentUserId, userRole);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<ApiResponse<LessonSummaryDto>> completeLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Role userRole = SecurityUtils.getCurrentUserRole();
        LessonSummaryDto updated = lessonService.completeLesson(courseId, lessonId, currentUserId, userRole);
        return ResponseEntity.ok(ApiResponse.success("Урок успешно завершен", updated));
    }
}
