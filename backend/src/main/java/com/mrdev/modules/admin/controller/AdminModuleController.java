package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.CreateModuleRequest;
import com.mrdev.modules.admin.dto.ReorderItemRequest;
import com.mrdev.modules.admin.dto.UpdateModuleRequest;
import com.mrdev.modules.admin.service.AdminCurriculumService;
import com.mrdev.modules.course.dto.CourseModuleDto;
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
public class AdminModuleController {

    private final AdminCurriculumService adminCurriculumService;

    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<ApiResponse<List<CourseModuleDto>>> getModulesForCourse(@PathVariable Long courseId) {
        List<CourseModuleDto> modules = adminCurriculumService.getModulesForCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<ApiResponse<CourseModuleDto>> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateModuleRequest request
    ) {
        CourseModuleDto module = adminCurriculumService.createModule(courseId, request);
        return new ResponseEntity<>(ApiResponse.success("Module created successfully", module), HttpStatus.CREATED);
    }

    @PutMapping("/modules/{moduleId}")
    public ResponseEntity<ApiResponse<CourseModuleDto>> updateModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody UpdateModuleRequest request
    ) {
        CourseModuleDto module = adminCurriculumService.updateModule(moduleId, request);
        return ResponseEntity.ok(ApiResponse.success("Module updated successfully", module));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<ApiResponse<Void>> deleteModule(@PathVariable Long moduleId) {
        adminCurriculumService.deleteModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success("Module deleted successfully", null));
    }

    @PutMapping("/courses/{courseId}/modules/reorder")
    public ResponseEntity<ApiResponse<List<CourseModuleDto>>> reorderModules(
            @PathVariable Long courseId,
            @RequestBody List<ReorderItemRequest> items
    ) {
        List<CourseModuleDto> reordered = adminCurriculumService.reorderModules(courseId, items);
        return ResponseEntity.ok(ApiResponse.success("Modules reordered successfully", reordered));
    }
}
