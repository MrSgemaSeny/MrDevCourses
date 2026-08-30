package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.CreateMaterialRequest;
import com.mrdev.modules.admin.service.AdminCurriculumService;
import com.mrdev.modules.lesson.dto.LessonMaterialDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaterialController {

    private final AdminCurriculumService adminCurriculumService;

    @PostMapping("/lessons/{lessonId}/materials")
    public ResponseEntity<ApiResponse<LessonMaterialDto>> addMaterial(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateMaterialRequest request
    ) {
        LessonMaterialDto material = adminCurriculumService.addMaterial(lessonId, request);
        return new ResponseEntity<>(ApiResponse.success("Material added successfully", material), HttpStatus.CREATED);
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable Long materialId) {
        adminCurriculumService.deleteMaterial(materialId);
        return ResponseEntity.ok(ApiResponse.success("Material deleted successfully", null));
    }
}
