package com.mrdev.modules.quiz.dto;

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
public class QuizResultDto {
    private Long submissionId;
    private Long quizId;
    private Integer scorePercentage;
    private Boolean passed;
    private Integer correctCount;
    private Integer totalCount;
    private Integer passingScorePercentage;
    private Map<Long, Boolean> questionResults; // questionId -> isCorrect
    private Map<Long, String> questionExplanations; // questionId -> explanation
}
