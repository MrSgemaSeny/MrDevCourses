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
        Long currentUserId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        List<ProjectShowcaseDto> list = showcaseService.getAllShowcases(currentUserId);
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean liked = showcaseService.toggleLike(userId, id);
        return ResponseEntity.ok(ApiResponse.success(liked));
    }
}
