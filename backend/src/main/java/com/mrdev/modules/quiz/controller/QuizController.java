package com.mrdev.modules.quiz.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.quiz.dto.QuizDto;
import com.mrdev.modules.quiz.dto.QuizResultDto;
import com.mrdev.modules.quiz.dto.QuizSubmitRequest;
import com.mrdev.modules.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/lessons/{lessonId}/quiz")
    public ResponseEntity<ApiResponse<QuizDto>> getQuiz(@PathVariable Long lessonId) {
        Long userId = SecurityUtils.getCurrentUserId();
        QuizDto quiz = quizService.getQuizByLessonId(lessonId, userId);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping("/lessons/{lessonId}/quiz/submit")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @PathVariable Long lessonId,
            @Valid @RequestBody QuizSubmitRequest request) {

        Long userId = SecurityUtils.getCurrentUserId();
        QuizResultDto result = quizService.submitQuiz(lessonId, userId, request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
