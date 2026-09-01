package com.mrdev.modules.lesson.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.lesson.dto.LessonPitfallDto;
import com.mrdev.modules.lesson.service.LessonPitfallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/courses/{courseId}/lessons/{lessonId}/pitfalls")
@RequiredArgsConstructor
public class LessonPitfallController {

    private final LessonPitfallService lessonPitfallService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LessonPitfallDto>>> getPitfalls(
            @PathVariable Long courseId,
            @PathVariable Long lessonId) {
        List<LessonPitfallDto> pitfalls = lessonPitfallService.getPitfallsByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success(pitfalls));
    }
}