package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuizScoreDto {
    private Long submissionId;
    private Long quizId;
    private String quizTitle;
    private Long lessonId;
    private String lessonTitle;
    private Integer scorePercentage;
    private Boolean passed;
    private Instant startedAt;
    private Instant completedAt;
}
