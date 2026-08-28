package com.mrdev.modules.course.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.course.dto.CourseDetailDto;
import com.mrdev.modules.course.dto.CourseDto;
import com.mrdev.modules.course.dto.EnrollmentDto;
import com.mrdev.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllActiveCourses() {
        Optional<Long> currentUserId = SecurityUtils.getCurrentUserIdOptional();
        List<CourseDto> courses = courseService.getActiveCourses(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseBySlug(@PathVariable String slug) {
        Optional<Long> currentUserId = SecurityUtils.getCurrentUserIdOptional();
        CourseDetailDto course = courseService.getCourseBySlug(slug, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<ApiResponse<EnrollmentDto>> enrollInCourse(@PathVariable Long courseId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        EnrollmentDto enrollment = courseService.enroll(courseId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Successfully enrolled in course", enrollment));
    }
}
