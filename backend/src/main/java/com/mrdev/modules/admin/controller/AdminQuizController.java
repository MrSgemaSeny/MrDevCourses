package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.CreateQuizRequest;
import com.mrdev.modules.admin.service.AdminCurriculumService;
import com.mrdev.modules.quiz.dto.QuizDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuizController {

    private final AdminCurriculumService adminCurriculumService;

    @GetMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<ApiResponse<QuizDto>> getQuizByLesson(@PathVariable Long lessonId) {
        QuizDto quiz = adminCurriculumService.getQuizByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<ApiResponse<QuizDto>> createOrUpdateQuiz(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateQuizRequest request
    ) {
        QuizDto quiz = adminCurriculumService.createOrUpdateQuiz(lessonId, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz saved successfully", quiz));
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(@PathVariable Long quizId) {
        adminCurriculumService.deleteQuiz(quizId);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted successfully", null));
    }
}
