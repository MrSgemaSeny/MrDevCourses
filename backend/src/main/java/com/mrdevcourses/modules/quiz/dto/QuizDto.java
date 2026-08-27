package com.mrdevcourses.modules.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDto {
    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private Integer passingScorePercentage;
    private Integer maxAttempts;
    private Integer timeLimitSeconds;
    private Integer questionsCount;
    private List<QuizQuestionDto> questions;
}
