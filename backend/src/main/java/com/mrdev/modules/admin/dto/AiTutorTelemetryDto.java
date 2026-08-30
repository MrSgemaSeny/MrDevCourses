package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorTelemetryDto {
    private long totalQuestions;
    private long estimatedTokensUsed;
    private long throttledCount;
    private long activeUsersCount;
    private double avgQuestionsPerUser;
    private List<AiTutorTopicDto> topLessonTopics;
}
