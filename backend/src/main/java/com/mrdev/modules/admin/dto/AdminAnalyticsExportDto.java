package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsExportDto {
    private Instant exportedAt;
    private Long courseId;
    private String courseTitle;
    private AdminOverviewMetricsDto overview;
    private List<CourseFunnelStepDto> funnel;
    private CourseRetentionDto retention;
    private AiTutorTelemetryDto aiTutorSummary;
    private List<QuizHotspotDto> quizHotspots;
}
