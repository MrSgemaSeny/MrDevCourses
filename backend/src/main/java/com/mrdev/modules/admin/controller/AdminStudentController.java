package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.dto.PageResponse;
import com.mrdev.modules.admin.dto.StudentDto;
import com.mrdev.modules.admin.dto.StudentProgressDetailDto;
import com.mrdev.modules.admin.dto.StudentRoleUpdateRequest;
import com.mrdev.modules.admin.service.AdminStudentService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.course.dto.EnrollmentDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StudentDto>>> searchStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<StudentDto> result = adminStudentService.searchStudents(q, role, courseId, page, size);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudentRole(
            @PathVariable Long userId,
            @Valid @RequestBody StudentRoleUpdateRequest request
    ) {
        StudentDto updated = adminStudentService.updateStudentRole(userId, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updated));
    }

    @PostMapping("/{userId}/enroll/{courseId}")
    public ResponseEntity<ApiResponse<EnrollmentDto>> enrollStudent(
            @PathVariable Long userId,
            @PathVariable Long courseId
    ) {
        EnrollmentDto enrollment = adminStudentService.enrollStudentManually(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled successfully", enrollment));
    }

    @DeleteMapping("/{userId}/enroll/{courseId}")
    public ResponseEntity<ApiResponse<Void>> unenrollStudent(
            @PathVariable Long userId,
            @PathVariable Long courseId
    ) {
        adminStudentService.unenrollStudentManually(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Student unenrolled successfully", null));
    }

    @GetMapping("/{userId}/progress")
    public ResponseEntity<ApiResponse<StudentProgressDetailDto>> getStudentProgress(
            @PathVariable Long userId
    ) {
        StudentProgressDetailDto progress = adminStudentService.getStudentProgress(userId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }
}
