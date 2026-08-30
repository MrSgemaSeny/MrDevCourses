package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.ReorderItemRequest;
import com.mrdev.modules.admin.service.AdminCurriculumService;
import com.mrdev.modules.course.dto.CourseDto;
import com.mrdev.modules.course.dto.CreateCourseRequest;
import com.mrdev.modules.course.dto.UpdateCourseRequest;
import com.mrdev.modules.admin.service.AdminService;
import com.mrdev.modules.lesson.dto.CreateLessonRequest;
import com.mrdev.modules.lesson.dto.LessonDetailDto;
import com.mrdev.modules.lesson.dto.UpdateLessonRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCurriculumController {

    private final AdminCurriculumService adminCurriculumService;
    private final AdminService adminService;

    // Course Endpoints
    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses() {
        List<CourseDto> courses = adminService.getAllCoursesAdmin();
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        CourseDto course = adminService.createCourse(request);
        return new ResponseEntity<>(ApiResponse.success("Course created successfully", course), HttpStatus.CREATED);
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request
    ) {
        CourseDto course = adminService.updateCourse(courseId, request);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long courseId) {
        adminService.deleteCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }

    // Lesson Endpoints
    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonDetailDto>>> getLessonsForCourse(@PathVariable Long courseId) {
        List<LessonDetailDto> lessons = adminService.getLessonsForCourseAdmin(courseId);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    @PostMapping("/courses/{courseId}/lessons")
    public ResponseEntity<ApiResponse<LessonDetailDto>> createLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateLessonRequest request
    ) {
        LessonDetailDto lesson = adminCurriculumService.createLesson(courseId, request);
        return new ResponseEntity<>(ApiResponse.success("Lesson created successfully", lesson), HttpStatus.CREATED);
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonDetailDto>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonRequest request
    ) {
        LessonDetailDto lesson = adminCurriculumService.updateLesson(lessonId, request);
        return ResponseEntity.ok(ApiResponse.success("Lesson updated successfully", lesson));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long lessonId) {
        adminCurriculumService.deleteLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lesson deleted successfully", null));
    }

    @PutMapping("/courses/{courseId}/lessons/reorder")
    public ResponseEntity<ApiResponse<List<LessonDetailDto>>> reorderLessons(
            @PathVariable Long courseId,
            @RequestBody List<ReorderItemRequest> items
    ) {
        List<LessonDetailDto> reordered = adminCurriculumService.reorderLessons(courseId, items);
        return ResponseEntity.ok(ApiResponse.success("Lessons reordered successfully", reordered));
    }
}
