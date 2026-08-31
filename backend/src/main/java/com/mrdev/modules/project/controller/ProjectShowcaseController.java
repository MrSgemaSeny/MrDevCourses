package com.mrdev.modules.project.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.project.dto.CreateProjectShowcaseRequest;
import com.mrdev.modules.project.dto.ProjectShowcaseDto;
import com.mrdev.modules.project.service.ProjectShowcaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/projects")
@RequiredArgsConstructor
public class ProjectShowcaseController {

    private final ProjectShowcaseService showcaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectShowcaseDto>>> getAllProjects() {
        List<ProjectShowcaseDto> list = showcaseService.getAllShowcases();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ProjectShowcaseDto>> createProject(
            @Valid @RequestBody CreateProjectShowcaseRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectShowcaseDto dto = showcaseService.createShowcase(userId, request);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> likeProject(@PathVariable Long id) {
        showcaseService.likeProject(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
