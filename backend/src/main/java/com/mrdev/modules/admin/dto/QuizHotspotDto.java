package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizHotspotDto {
    private Long questionId;
    private String questionText;
    private Long quizId;
    private String quizTitle;
    private String lessonTitle;
    private String courseTitle;
    private long totalAttempts;
    private long failureCount;
    private double failureRate;
    private double passRate;
    private String mostCommonWrongOption;
}
