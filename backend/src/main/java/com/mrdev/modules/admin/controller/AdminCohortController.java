package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.CohortDto;
import com.mrdev.modules.admin.dto.CreateCohortRequest;
import com.mrdev.modules.admin.dto.UpdateCohortRequest;
import com.mrdev.modules.admin.service.AdminCohortService;
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
public class AdminCohortController {

    private final AdminCohortService adminCohortService;

    @GetMapping("/cohorts")
    public ResponseEntity<ApiResponse<List<CohortDto>>> getAllCohorts() {
        List<CohortDto> cohorts = adminCohortService.getAllCohorts();
        return ResponseEntity.ok(ApiResponse.success(cohorts));
    }

    @GetMapping("/courses/{courseId}/cohorts")
    public ResponseEntity<ApiResponse<List<CohortDto>>> getCohortsForCourse(@PathVariable Long courseId) {
        List<CohortDto> cohorts = adminCohortService.getCohortsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success(cohorts));
    }

    @GetMapping("/cohorts/{cohortId}")
    public ResponseEntity<ApiResponse<CohortDto>> getCohortById(@PathVariable Long cohortId) {
        CohortDto cohort = adminCohortService.getCohortById(cohortId);
        return ResponseEntity.ok(ApiResponse.success(cohort));
    }

    @PostMapping("/courses/{courseId}/cohorts")
    public ResponseEntity<ApiResponse<CohortDto>> createCohortForCourse(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateCohortRequest request
    ) {
        CohortDto created = adminCohortService.createCohort(courseId, request);
        return new ResponseEntity<>(ApiResponse.success("Cohort created successfully", created), HttpStatus.CREATED);
    }

    @PostMapping("/cohorts")
    public ResponseEntity<ApiResponse<CohortDto>> createCohort(
            @Valid @RequestBody CreateCohortRequest request
    ) {
        CohortDto created = adminCohortService.createCohort(request.getCourseId(), request);
        return new ResponseEntity<>(ApiResponse.success("Cohort created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/cohorts/{cohortId}")
    public ResponseEntity<ApiResponse<CohortDto>> updateCohort(
            @PathVariable Long cohortId,
            @Valid @RequestBody UpdateCohortRequest request
    ) {
        CohortDto updated = adminCohortService.updateCohort(cohortId, request);
        return ResponseEntity.ok(ApiResponse.success("Cohort updated successfully", updated));
    }

    @DeleteMapping("/cohorts/{cohortId}")
    public ResponseEntity<ApiResponse<Void>> deleteCohort(@PathVariable Long cohortId) {
        adminCohortService.deleteCohort(cohortId);
        return ResponseEntity.ok(ApiResponse.success("Cohort deleted successfully", null));
    }
}
