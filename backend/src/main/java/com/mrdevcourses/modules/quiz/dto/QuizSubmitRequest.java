package com.mrdevcourses.modules.quiz.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    @NotNull
    private Long quizId;

    // Map: questionId -> list of selected option IDs or text response
    private Map<Long, List<Long>> selectedOptionIds;
}
